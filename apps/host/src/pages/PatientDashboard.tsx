import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { InputField, SelectField, TextareaField } from "../components/FormControls";
import { Panel } from "../components/Panel";
import { combineDateTime, formatDateTime, inputDate, personName } from "../lib/format";
import { useRootStore } from "../stores/storeContext";
import type { CreateAppointmentRequest } from "../types";

type AppointmentFormState = {
  date: string;
  doctor_id: string;
  patient_notes: string;
  time: string;
};

type ProfileFormState = {
  birth_date: string;
  email: string;
  first_name: string;
  gender: "M" | "F";
  last_name: string;
  patronymic: string;
  phone: string;
};

const emptyAppointmentForm: AppointmentFormState = {
  date: "",
  doctor_id: "",
  patient_notes: "",
  time: "",
};

export const PatientDashboard = observer(() => {
  const { data } = useRootStore();
  const [message, setMessage] = useState<string | null>(null);
  const [profileForm, setProfileForm] = useState<ProfileFormState | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [appointmentForm, setAppointmentForm] = useState<AppointmentFormState>(emptyAppointmentForm);

  useEffect(() => {
    void data.loadDashboardData();
  }, [data]);

  useEffect(() => {
    if (!data.currentPatient) return;

    setProfileForm({
      birth_date: inputDate(data.currentPatient.birth_date),
      email: data.currentPatient.email,
      first_name: data.currentPatient.first_name,
      gender: data.currentPatient.gender,
      last_name: data.currentPatient.last_name,
      patronymic: data.currentPatient.patronymic ?? "",
      phone: data.currentPatient.phone ?? "",
    });
  }, [data.currentPatient]);

  useEffect(() => {
    const firstActiveDoctorId = data.activeDoctors[0]?.id ?? "";
    setAppointmentForm((current) => ({
      ...current,
      doctor_id: current.doctor_id || firstActiveDoctorId,
    }));
  }, [data.activeDoctors]);

  const pageError = requestError ?? data.requestError;

  return (
    <div className="dashboard-grid">
      {pageError ? <div className="notice notice-error">{pageError}</div> : null}
      {message ? <div className="notice notice-success">{message}</div> : null}

      <Panel eyebrow="Профиль" title="Мои данные">
        {data.loading || !profileForm ? (
          <p className="muted-text">Загрузка профиля...</p>
        ) : (
          <form
            className="form-grid form-grid-columns"
            onSubmit={(event) => {
              event.preventDefault();
              void (async () => {
                try {
                  setRequestError(null);
                  const updatedProfile = await data.updatePatientProfile({
                    birth_date: profileForm.birth_date,
                    email: profileForm.email,
                    first_name: profileForm.first_name,
                    gender: profileForm.gender,
                    last_name: profileForm.last_name,
                    patronymic: profileForm.patronymic.trim() || null,
                    phone: profileForm.phone.trim() || null,
                  });

                  setProfileForm({
                    birth_date: inputDate(updatedProfile.birth_date),
                    email: updatedProfile.email,
                    first_name: updatedProfile.first_name,
                    gender: updatedProfile.gender,
                    last_name: updatedProfile.last_name,
                    patronymic: updatedProfile.patronymic ?? "",
                    phone: updatedProfile.phone ?? "",
                  });
                  setMessage("Данные пациента обновлены.");
                } catch (error) {
                  setRequestError(error instanceof Error ? error.message : "Не удалось сохранить профиль.");
                }
              })();
            }}
          >
            <InputField
              label="Имя"
              onChange={(event) => setProfileForm((current) => current && { ...current, first_name: event.target.value })}
              required
              value={profileForm.first_name}
            />
            <InputField
              label="Фамилия"
              onChange={(event) => setProfileForm((current) => current && { ...current, last_name: event.target.value })}
              required
              value={profileForm.last_name}
            />
            <InputField
              label="Отчество"
              onChange={(event) => setProfileForm((current) => current && { ...current, patronymic: event.target.value })}
              value={profileForm.patronymic}
            />
            <InputField
              label="Email"
              onChange={(event) => setProfileForm((current) => current && { ...current, email: event.target.value })}
              required
              type="email"
              value={profileForm.email}
            />
            <InputField
              label="Телефон"
              onChange={(event) => setProfileForm((current) => current && { ...current, phone: event.target.value })}
              value={profileForm.phone}
            />
            <InputField
              label="Дата рождения"
              onChange={(event) => setProfileForm((current) => current && { ...current, birth_date: event.target.value })}
              required
              type="date"
              value={profileForm.birth_date}
            />
            <SelectField
              label="Пол"
              onChange={(event) =>
                setProfileForm((current) =>
                  current
                    ? {
                        ...current,
                        gender: event.target.value as "M" | "F",
                      }
                    : current,
                )
              }
              options={[
                { label: "Мужской", value: "M" },
                { label: "Женский", value: "F" },
              ]}
              required
              value={profileForm.gender}
            />
            <button className="primary-button" type="submit">
              Сохранить данные
            </button>
          </form>
        )}
      </Panel>

      <Panel eyebrow="Запись" title="Записаться на прием">
        <form
          className="form-grid form-grid-columns"
          onSubmit={(event) => {
            event.preventDefault();
            void (async () => {
              try {
                setRequestError(null);
                const payload: CreateAppointmentRequest = {
                  doctor_id: appointmentForm.doctor_id,
                  patient_notes: appointmentForm.patient_notes.trim() || null,
                  start_time: combineDateTime(appointmentForm.date, appointmentForm.time),
                };

                await data.createAppointment(payload);
                setAppointmentForm({
                  ...emptyAppointmentForm,
                  doctor_id: data.activeDoctors[0]?.id || "",
                });
                setMessage("Запись успешно создана.");
              } catch (error) {
                setRequestError(error instanceof Error ? error.message : "Не удалось создать запись.");
              }
            })();
          }}
        >
          <SelectField
            label="Специалист"
            onChange={(event) => setAppointmentForm((current) => ({ ...current, doctor_id: event.target.value }))}
            options={[
              { label: "Выберите врача", value: "" },
              ...data.activeDoctors.map((doctor) => ({
                label: `${personName(doctor)} · ${doctor.specialty}`,
                value: doctor.id,
              })),
            ]}
            required
            value={appointmentForm.doctor_id}
          />
          <InputField
            label="Дата"
            min={new Date().toISOString().slice(0, 10)}
            onChange={(event) => setAppointmentForm((current) => ({ ...current, date: event.target.value }))}
            required
            type="date"
            value={appointmentForm.date}
          />
          <InputField
            label="Время"
            onChange={(event) => setAppointmentForm((current) => ({ ...current, time: event.target.value }))}
            required
            type="time"
            value={appointmentForm.time}
          />
          <TextareaField
            label="Комментарий к приему"
            onChange={(event) => setAppointmentForm((current) => ({ ...current, patient_notes: event.target.value }))}
            placeholder="Кратко опишите жалобу или причину обращения"
            value={appointmentForm.patient_notes}
          />
          <button className="primary-button" type="submit">
            Отправить запись
          </button>
        </form>
      </Panel>

      <Panel eyebrow="Визиты" title="Мои записи">
        {data.loading ? (
          <p className="muted-text">Загрузка записей...</p>
        ) : data.appointments.length === 0 ? (
          <p className="muted-text">Записей пока нет.</p>
        ) : (
          <div className="list-grid">
            {data.appointments
              .slice()
              .sort((left, right) => new Date(left.start_time).getTime() - new Date(right.start_time).getTime())
              .map((appointment) => {
                const doctor = data.doctorsById[appointment.doctor_id];

                return (
                  <article className="record-card" key={appointment.id}>
                    <div className="record-head">
                      <div>
                        <h3>{doctor ? personName(doctor) : appointment.doctor_id}</h3>
                        <p>{doctor?.specialty ?? "Специальность не найдена"}</p>
                      </div>
                      <span className="status-chip">{appointment.progress}</span>
                    </div>
                    <dl className="record-meta">
                      <div>
                        <dt>Дата и время</dt>
                        <dd>{formatDateTime(appointment.start_time)}</dd>
                      </div>
                      <div>
                        <dt>Комментарий</dt>
                        <dd>{appointment.patient_notes || "Не указан"}</dd>
                      </div>
                      <div>
                        <dt>Заметки врача</dt>
                        <dd>{appointment.doctor_notes || "Пока нет"}</dd>
                      </div>
                    </dl>
                    <button
                      className="secondary-button"
                      disabled={appointment.progress !== "Назначен"}
                      onClick={() => {
                        void (async () => {
                          try {
                            setRequestError(null);
                            await data.cancelAppointment(appointment.id);
                            setMessage("Запись отменена.");
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
                );
              })}
          </div>
        )}
      </Panel>
    </div>
  );
});
