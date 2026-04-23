export type UserRole = "P" | "D" | "A";
export type Gender = "M" | "F";

export interface SessionUser {
  exp: number;
  iat: number;
  jti: string;
  user_id: string;
  user_name: string;
  user_role: UserRole;
  ver: number;
}

export interface SessionState {
  accessToken: string;
  refreshToken: string;
  user: SessionUser;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
}

export interface RegisterRequest {
  birth_date: string;
  email: string;
  first_name: string;
  gender: Gender;
  last_name: string;
  password: string;
  patronymic: string | null;
  phone: string | null;
  role?: UserRole;
  username: string;
}

export interface RegisterResponse {
  result: number;
  userId: string | null;
}

export interface PatientInfo {
  birth_date: string;
  created_at: string;
  email: string;
  first_name: string;
  gender: Gender;
  id: string;
  last_name: string;
  patronymic: string | null;
  phone: string | null;
  updated_at: string;
  user_id: string;
}

export interface DoctorInfo {
  first_name: string;
  id: string;
  is_active: boolean;
  last_name: string;
  notes: string | null;
  patronymic: string | null;
  shift_end: string;
  shift_start: string;
  slot_minutes: number;
  specialty: string;
  user_id: string;
  work_days: number;
}

export interface AppointmentInfo {
  created_at: string;
  doctor_id: string;
  doctor_notes: string | null;
  id: string;
  patient_id: string;
  patient_notes: string | null;
  progress: string;
  start_time: string;
  updated_at: string;
}

export interface CreateAppointmentRequest {
  doctor_id: string;
  patient_notes: string | null;
  start_time: string;
}

export interface AddUserRequest extends RegisterRequest {
  role: UserRole;
}

export interface ApiClient {
  get<T>(path: string, init?: RequestInit & { retryOnAuth?: boolean; skipAuth?: boolean }): Promise<T>;
  post<T>(path: string, body?: unknown, init?: RequestInit & { retryOnAuth?: boolean; skipAuth?: boolean }): Promise<T>;
}
