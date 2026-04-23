import { makeAutoObservable, runInAction } from "mobx";
import { createApiClient } from "../lib/api";
import { clearSessionStorage, createSession, loadSession, persistSession } from "../lib/session";
import type {
  AddUserRequest,
  ApiClient,
  AppointmentInfo,
  CreateAppointmentRequest,
  DoctorInfo,
  LoginRequest,
  LoginResponse,
  PatientInfo,
  RegisterRequest,
  RegisterResponse,
  SessionState,
} from "../types";

type CacheEntry<T> = {
  expiresAt: number;
  promise?: Promise<T>;
  value?: T;
};

const CACHE_TTL_MS = 60_000;

export class RootStore {
  readonly auth: AuthStore;
  readonly data: DataStore;
  readonly api: ApiClient;

  constructor(baseUrl: string) {
    this.auth = new AuthStore(this);
    this.data = new DataStore(this);
    this.api = createApiClient(baseUrl, {
      clear: () => this.auth.clearSession(),
      get: () => this.auth.session,
      save: (session) => this.auth.setSession(session),
    });
  }
}

class AuthStore {
  authBusy = false;
  authError: string | null = null;
  session: SessionState | null = loadSession();

  constructor(private readonly root: RootStore) {
    makeAutoObservable<AuthStore, "root">(this, { root: false }, { autoBind: true });
  }

  get isAuthenticated() {
    return Boolean(this.session);
  }

  get currentUser() {
    return this.session?.user ?? null;
  }

  setSession(session: SessionState) {
    this.session = session;
    persistSession(session);
  }

  clearSession() {
    this.session = null;
    clearSessionStorage();
    this.root.data.clear();
  }

  async login(payload: LoginRequest) {
    this.authBusy = true;
    this.authError = null;

    try {
      const response = await this.root.api.post<LoginResponse>("/auth/login", payload, {
        retryOnAuth: false,
        skipAuth: true,
      });
      const nextSession = createSession(response.access_token, response.refresh_token);
      if (!nextSession) throw new Error("Сервер вернул некорректный access token.");

      runInAction(() => {
        this.setSession(nextSession);
      });
      await this.root.data.loadCurrentUserInfo();
    } catch (error) {
      runInAction(() => {
        this.authError = error instanceof Error ? error.message : "Не удалось выполнить вход.";
      });
    } finally {
      runInAction(() => {
        this.authBusy = false;
      });
    }
  }

  async register(payload: RegisterRequest) {
    this.authBusy = true;
    this.authError = null;

    try {
      const response = await this.root.api.post<RegisterResponse>("/auth/register", payload, {
        retryOnAuth: false,
        skipAuth: true,
      });

      if (response.result !== 0) {
        throw new Error(
          response.result === 1
            ? "Пользователь с таким логином уже существует."
            : "Не удалось завершить регистрацию.",
        );
      }

      runInAction(() => {
        this.authBusy = false;
      });
      await this.login({
        password: payload.password,
        username: payload.username,
      });
    } catch (error) {
      runInAction(() => {
        this.authError = error instanceof Error ? error.message : "Не удалось зарегистрировать пациента.";
      });
    } finally {
      runInAction(() => {
        this.authBusy = false;
      });
    }
  }

  async logout() {
    const refreshToken = this.session?.refreshToken;
    if (refreshToken) {
      try {
        await this.root.api.post<void>(
          "/auth/logout",
          { token: refreshToken },
          {
            retryOnAuth: false,
            skipAuth: true,
          },
        );
      } catch {
        // Локальный выход должен сработать даже если logout завершился ошибкой.
      }
    }

    this.clearSession();
  }
}

export class DataStore {
  appointments: AppointmentInfo[] = [];
  doctors: DoctorInfo[] = [];
  patients: PatientInfo[] = [];
  currentDoctor: DoctorInfo | null = null;
  currentPatient: PatientInfo | null = null;
  loading = false;
  requestError: string | null = null;

  private cache = new Map<string, CacheEntry<unknown>>();

  constructor(private readonly root: RootStore) {
    makeAutoObservable<DataStore, "cache" | "root">(this, { cache: false, root: false }, { autoBind: true });
  }

  get doctorsById() {
    return this.doctors.reduce<Record<string, DoctorInfo>>((accumulator, doctor) => {
      accumulator[doctor.id] = doctor;
      return accumulator;
    }, {});
  }

  get patientsById() {
    return this.patients.reduce<Record<string, PatientInfo>>((accumulator, patient) => {
      accumulator[patient.id] = patient;
      return accumulator;
    }, {});
  }

  get activeDoctors() {
    return this.doctors.filter((doctor) => doctor.is_active);
  }

  get currentUserInfo() {
    return this.currentPatient ?? this.currentDoctor;
  }

  clear() {
    this.appointments = [];
    this.doctors = [];
    this.patients = [];
    this.currentDoctor = null;
    this.currentPatient = null;
    this.loading = false;
    this.requestError = null;
    this.cache.clear();
  }

  invalidate(...keys: string[]) {
    keys.forEach((key) => this.cache.delete(key));
  }

  async loadDashboardData(force = false) {
    this.loading = true;
    this.requestError = null;

    try {
      const role = this.root.auth.currentUser?.user_role;
      if (role === "P") {
        await Promise.all([this.loadDoctors(force), this.loadAppointments(force), this.loadCurrentUserInfo(force)]);
      } else if (role === "D") {
        await Promise.all([this.loadPatients(force), this.loadAppointments(force), this.loadCurrentUserInfo(force)]);
      } else if (role === "A") {
        await Promise.all([this.loadDoctors(force), this.loadPatients(force), this.loadAppointments(force)]);
      }
    } catch (error) {
      runInAction(() => {
        this.requestError =
          error instanceof Error ? error.message : "Не удалось загрузить данные кабинета.";
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  async loadCurrentUserInfo(force = false) {
    const user = this.root.auth.currentUser;
    if (!user) return;

    if (user.user_role === "P") {
      const patient = await this.getCached(`patients/info:${user.user_id}`, () =>
        this.root.api.get<PatientInfo>(`/users/patients/info?id=${user.user_id}`),
      force);
      runInAction(() => {
        this.currentPatient = patient;
      });
      return;
    }

    if (user.user_role === "D") {
      const doctor = await this.getCached(`doctors/info:${user.user_id}`, () =>
        this.root.api.get<DoctorInfo>(`/users/doctors/info?id=${user.user_id}`),
      force);
      runInAction(() => {
        this.currentDoctor = doctor;
      });
    }
  }

  async loadDoctors(force = false) {
    const doctors = await this.getCached("doctors/get", () => this.root.api.get<DoctorInfo[]>("/users/doctors/get"), force);
    runInAction(() => {
      this.doctors = doctors;
    });
  }

  async loadPatients(force = false) {
    const patients = await this.getCached("patients/get", () => this.root.api.get<PatientInfo[]>("/users/patients/get"), force);
    runInAction(() => {
      this.patients = patients;
    });
  }

  async loadAppointments(force = false) {
    const appointments = await this.getCached("appointments/get", () => this.root.api.get<AppointmentInfo[]>("/appointments/get"), force);
    runInAction(() => {
      this.appointments = appointments;
    });
  }

  async updatePatientProfile(profile: Omit<PatientInfo, "created_at" | "id" | "updated_at" | "user_id">) {
    const updatedProfile = await this.root.api.post<PatientInfo>("/users/patients/update", profile);
    runInAction(() => {
      this.currentPatient = updatedProfile;
    });
    this.invalidate("patients/get", `patients/info:${this.root.auth.currentUser?.user_id}`);
    return updatedProfile;
  }

  async createAppointment(payload: CreateAppointmentRequest) {
    const appointment = await this.root.api.post<AppointmentInfo>("/appointments/create", payload);
    this.invalidate("appointments/get");
    await this.loadAppointments(true);
    return appointment;
  }

  async completeAppointment(appointmentId: string, doctorNotes: string) {
    const appointment = await this.root.api.post<AppointmentInfo>("/appointments/complete", {
      appointment_id: appointmentId,
      doctor_notes: doctorNotes,
    });
    this.invalidate("appointments/get");
    await this.loadAppointments(true);
    return appointment;
  }

  async cancelAppointment(appointmentId: string) {
    const result = await this.root.api.post<boolean>("/appointments/cancel", {
      appointment_id: appointmentId,
    });
    this.invalidate("appointments/get");
    await this.loadAppointments(true);
    return result;
  }

  async addUser(payload: AddUserRequest) {
    const response = await this.root.api.post<{ result: number; userId: string | null }>("/auth/admin/add_user", payload);
    this.invalidate("patients/get", "doctors/get");
    await Promise.all([this.loadPatients(true), this.loadDoctors(true)]);
    return response;
  }

  private async getCached<T>(key: string, loader: () => Promise<T>, force = false): Promise<T> {
    const cached = this.cache.get(key) as CacheEntry<T> | undefined;
    const now = Date.now();

    if (!force && cached?.value !== undefined && cached.expiresAt > now) {
      return cached.value;
    }

    if (!force && cached?.promise) {
      return cached.promise;
    }

    const promise = loader()
      .then((value) => {
        this.cache.set(key, {
          expiresAt: Date.now() + CACHE_TTL_MS,
          value,
        });
        return value;
      })
      .catch((error) => {
        this.cache.delete(key);
        throw error;
      });

    this.cache.set(key, {
      expiresAt: now + CACHE_TTL_MS,
      promise,
    });

    return promise;
  }
}
