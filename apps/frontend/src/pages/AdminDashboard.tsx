import { useMemo, useState } from "react";
import { InputField, SelectField } from "../components/FormControls";
import { Panel } from "../components/Panel";
import { formatDateTime, personName } from "../lib/format";
import { getErrorMessage } from "../lib/queryError";
import {
  useAddUserMutation,
  useCancelAppointmentMutation,
  useGetAppointmentsQuery,
  useGetDoctorsQuery,
  useGetPatientsQuery,
} from "../store/apiSlice";
import type { AddUserRequest } from "../types";

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

export const AdminDashboard = () => {
  const { data: appointments = [], error: appointmentsError, isLoading: appointmentsLoading } = useGetAppointmentsQuery();
  const { data: doctors = [], error: doctorsError, isLoading: doctorsLoading } = useGetDoctorsQuery();
  const { data: patients = [], error: patientsError, isLoading: patientsLoading } = useGetPatientsQuery();
  const [addUser] = useAddUserMutation();
  const [cancelAppointment] = useCancelAppointmentMutation();
  const [message, setMessage] = useState<string | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [userForm, setUserForm] = useState<AddUserRequest>(emptyUserForm);
  const loading = appointmentsLoading || doctorsLoading || patientsLoading;
  const queryError =
    getErrorMessage(doctorsError, "Не удалось загрузить врачей.") ||
    getErrorMessage(patientsError, "Не удалось загрузить пациентов.") ||
    getErrorMessage(appointmentsError, "Не удалось загрузить записи.");

  const names = useMemo(() => {
    const map = new Map<string, string>();
    patients.forEach((patient) => map.set(patient.id, personName(patient)));
    doctors.forEach((doctor) => map.set(doctor.id, `${personName(doctor)} (${doctor.specialty})`));
    return map;
  }, [doctors, patients]);

  return (
    <div className="dashboard-grid">
      {queryError || requestError ? <div className="notice notice-error">{requestError || queryError}</div> : null}
      {message ? <div className="notice notice-success">{message}</div> : null}

      <Panel eyebrow="Пользователи" title="Создать пользователя">
        <form
          className="form-grid form-grid-columns"
          onSubmit={(event) => {
            event.preventDefault();
            void (async () => {
              try {
                setRequestError(null);
                const response = await addUser({
                  ...userForm,
                  patronymic: userForm.patronymic?.trim() || null,
                  phone: userForm.phone?.trim() || null,
                }).unwrap();

                if (response.result !== 0) {
                  throw new Error(
                    response.result === 1
                      ? "Пользователь с таким логином уже существует."
                      : "Не удалось создать пользователя.",
                  );
                }

                setUserForm(emptyUserForm);
                setMessage("Новый пользователь добавлен.");
              } catch (error) {
                setRequestError(getErrorMessage(error, "Не удалось создать пользователя."));
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
              { label: "Администратор", value: "A" },
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

      <Panel eyebrow="Приемы" title="Журнал записей">
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
                    <dt>Дата и время</dt>
                    <dd>{formatDateTime(appointment.start_time)}</dd>
                  </div>
                  <div>
                    <dt>Комментарий пациента</dt>
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
                        setRequestError(null);
                        await cancelAppointment({
                          appointment_id: appointment.id,
                        }).unwrap();
                        setMessage("Запись отменена администратором.");
                      } catch (error) {
                        setRequestError(getErrorMessage(error, "Не удалось отменить запись."));
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
    </div>
  );
};
