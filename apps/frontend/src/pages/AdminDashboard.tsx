import { useEffect, useMemo, useState } from "react";
import { InputField, SelectField } from "../components/FormControls";
import { Panel } from "../components/Panel";
import { formatDateTime, personName } from "../lib/format";
import type { AddUserRequest, ApiClient, AppointmentInfo, DoctorInfo, PatientInfo } from "../types";

type AdminDashboardProps = {
  api: ApiClient;
};

const emptyUserForm: AddUserRequest = {
  birth_date: "",
  email: "",
  first_name: "",
  gender: "M",
  last_name: "",
  password: "",
  patronymic: null,
  phone: null,
  role: "P",
  username: "",
};

export const AdminDashboard = ({ api }: AdminDashboardProps) => {
  const [appointments, setAppointments] = useState<AppointmentInfo[]>([]);
  const [doctors, setDoctors] = useState<DoctorInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [patients, setPatients] = useState<PatientInfo[]>([]);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [userForm, setUserForm] = useState<AddUserRequest>(emptyUserForm);

  const names = useMemo(() => {
    const map = new Map<string, string>();
    patients.forEach((patient) => map.set(patient.id, personName(patient)));
    doctors.forEach((doctor) => map.set(doctor.id, `${personName(doctor)} (${doctor.specialty})`));
    return map;
  }, [doctors, patients]);

  const loadData = async () => {
    setLoading(true);
    setRequestError(null);

    try {
      const [doctorList, patientList, appointmentList] = await Promise.all([
        api.get<DoctorInfo[]>("/users/doctors/get"),
        api.get<PatientInfo[]>("/users/patients/get"),
        api.get<AppointmentInfo[]>("/appointments/get"),
      ]);

      setDoctors(doctorList);
      setPatients(patientList);
      setAppointments(appointmentList);
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : "Не удалось загрузить админ-панель.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  return (
    <div className="dashboard-grid">
      {requestError ? <div className="notice notice-error">{requestError}</div> : null}
      {message ? <div className="notice notice-success">{message}</div> : null}

      <Panel eyebrow="Администрирование" title="Создать пользователя">
        <form
          className="form-grid form-grid-columns"
          onSubmit={(event) => {
            event.preventDefault();
            void (async () => {
              try {
                const response = await api.post<{ result: number; userId: string | null }>("/auth/admin/add_user", {
                  ...userForm,
                  patronymic: userForm.patronymic?.trim() || null,
                  phone: userForm.phone?.trim() || null,
                });

                if (response.result !== 0) {
                  throw new Error(
                    response.result === 1
                      ? "Пользователь с таким логином уже существует."
                      : "Backend не смог создать пользователя.",
                  );
                }

                setUserForm(emptyUserForm);
                setMessage("Новый пользователь добавлен.");
                await loadData();
              } catch (error) {
                setRequestError(error instanceof Error ? error.message : "Не удалось создать пользователя.");
              }
            })();
          }}
        >
          <SelectField
            label="Роль"
            onChange={(event) =>
              setUserForm((current) => ({
                ...current,
                role: event.target.value as "P" | "D" | "A",
              }))
            }
            options={[
              { label: "Пациент", value: "P" },
              { label: "Врач", value: "D" },
              { label: "Админ", value: "A" },
            ]}
            required
            value={userForm.role}
          />
          <InputField
            label="Логин"
            onChange={(event) => setUserForm((current) => ({ ...current, username: event.target.value }))}
            required
            value={userForm.username}
          />
          <InputField
            label="Пароль"
            onChange={(event) => setUserForm((current) => ({ ...current, password: event.target.value }))}
            required
            type="password"
            value={userForm.password}
          />
          <InputField
            label="Имя"
            onChange={(event) => setUserForm((current) => ({ ...current, first_name: event.target.value }))}
            required
            value={userForm.first_name}
          />
          <InputField
            label="Фамилия"
            onChange={(event) => setUserForm((current) => ({ ...current, last_name: event.target.value }))}
            required
            value={userForm.last_name}
          />
          <InputField
            label="Отчество"
            onChange={(event) =>
              setUserForm((current) => ({
                ...current,
                patronymic: event.target.value || null,
              }))
            }
            value={userForm.patronymic ?? ""}
          />
          <InputField
            label="Email"
            onChange={(event) => setUserForm((current) => ({ ...current, email: event.target.value }))}
            required
            type="email"
            value={userForm.email}
          />
          <InputField
            label="Телефон"
            onChange={(event) =>
              setUserForm((current) => ({
                ...current,
                phone: event.target.value || null,
              }))
            }
            value={userForm.phone ?? ""}
          />
          <InputField
            label="Дата рождения"
            onChange={(event) => setUserForm((current) => ({ ...current, birth_date: event.target.value }))}
            required
            type="date"
            value={userForm.birth_date}
          />
          <SelectField
            label="Пол"
            onChange={(event) =>
              setUserForm((current) => ({
                ...current,
                gender: event.target.value as "M" | "F",
              }))
            }
            options={[
              { label: "Мужской", value: "M" },
              { label: "Женский", value: "F" },
            ]}
            required
            value={userForm.gender}
          />
          <button className="primary-button" type="submit">
            Создать пользователя
          </button>
        </form>
      </Panel>

      <Panel eyebrow="Общий реестр" title="appointments/get">
        {loading ? (
          <p className="muted-text">Загрузка записей...</p>
        ) : (
          <div className="list-grid">
            {appointments.map((appointment) => (
              <article className="record-card" key={appointment.id}>
                <div className="record-head">
                  <div>
                    <h3>{names.get(appointment.patient_id) ?? appointment.patient_id}</h3>
                    <p>{names.get(appointment.doctor_id) ?? appointment.doctor_id}</p>
                  </div>
                  <span className="status-chip">{appointment.progress}</span>
                </div>
                <dl className="record-meta">
                  <div>
                    <dt>Время</dt>
                    <dd>{formatDateTime(appointment.start_time)}</dd>
                  </div>
                  <div>
                    <dt>Пациент</dt>
                    <dd>{appointment.patient_notes || "Без комментария"}</dd>
                  </div>
                  <div>
                    <dt>Заметки врача</dt>
                    <dd>{appointment.doctor_notes || "Не заполнены"}</dd>
                  </div>
                </dl>
                <button
                  className="secondary-button"
                  disabled={appointment.progress !== "Назначен"}
                  onClick={() => {
                    void (async () => {
                      try {
                        await api.post<boolean>("/appointments/cancel", {
                          appointment_id: appointment.id,
                        });
                        setMessage("Запись отменена администратором.");
                        await loadData();
                      } catch (error) {
                        setRequestError(error instanceof Error ? error.message : "Не удалось отменить запись.");
                      }
                    })();
                  }}
                  type="button"
                >
                  Отменить запись
                </button>
              </article>
            ))}
          </div>
        )}
      </Panel>

      <Panel eyebrow="Справочники users" title="Врачи и пациенты">
        <div className="split-grid">
          <div className="directory-table">
            <div className="directory-row directory-row-head">
              <span>Врач</span>
              <span>Специальность</span>
            </div>
            {doctors.map((doctor) => (
              <div className="directory-row" key={doctor.id}>
                <span>{personName(doctor)}</span>
                <span>{doctor.specialty}</span>
              </div>
            ))}
          </div>
          <div className="directory-table">
            <div className="directory-row directory-row-head">
              <span>Пациент</span>
              <span>Email</span>
            </div>
            {patients.map((patient) => (
              <div className="directory-row" key={patient.id}>
                <span>{personName(patient)}</span>
                <span>{patient.email}</span>
              </div>
            ))}
          </div>
        </div>
      </Panel>
    </div>
  );
};
