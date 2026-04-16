import { useEffect, useMemo, useState } from "react";
import { TextareaField } from "../components/FormControls";
import { Panel } from "../components/Panel";
import { formatDateTime, personName } from "../lib/format";
import type { ApiClient, AppointmentInfo, DoctorInfo, PatientInfo, SessionState } from "../types";

type DoctorDashboardProps = {
  api: ApiClient;
  session: SessionState;
};

export const DoctorDashboard = ({ api, session }: DoctorDashboardProps) => {
  const [appointments, setAppointments] = useState<AppointmentInfo[]>([]);
  const [doctorInfo, setDoctorInfo] = useState<DoctorInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [patients, setPatients] = useState<PatientInfo[]>([]);
  const [requestError, setRequestError] = useState<string | null>(null);

  const patientsById = useMemo(
    () =>
      patients.reduce<Record<string, PatientInfo>>((accumulator, patient) => {
        accumulator[patient.id] = patient;
        return accumulator;
      }, {}),
    [patients],
  );

  const loadData = async () => {
    setLoading(true);
    setRequestError(null);

    try {
      const [profile, appointmentList, patientList] = await Promise.all([
        api.get<DoctorInfo>(`/users/doctors/info?id=${session.user.user_id}`),
        api.get<AppointmentInfo[]>("/appointments/get"),
        api.get<PatientInfo[]>("/users/patients/get"),
      ]);

      setDoctorInfo(profile);
      setAppointments(appointmentList);
      setPatients(patientList);
      setNoteDrafts(
        appointmentList.reduce<Record<string, string>>((accumulator, appointment) => {
          accumulator[appointment.id] = appointment.doctor_notes ?? "";
          return accumulator;
        }, {}),
      );
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : "Не удалось загрузить кабинет врача.");
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

      <Panel eyebrow="Профиль врача" title="Моя смена">
        {loading || !doctorInfo ? (
          <p className="muted-text">Загрузка профиля врача...</p>
        ) : (
          <div className="meta-grid">
            <div className="meta-card">
              <span>ФИО</span>
              <strong>{personName(doctorInfo)}</strong>
            </div>
            <div className="meta-card">
              <span>Специальность</span>
              <strong>{doctorInfo.specialty}</strong>
            </div>
            <div className="meta-card">
              <span>Смена</span>
              <strong>
                {doctorInfo.shift_start} - {doctorInfo.shift_end}
              </strong>
            </div>
            <div className="meta-card">
              <span>Шаг слотов</span>
              <strong>{doctorInfo.slot_minutes} мин.</strong>
            </div>
          </div>
        )}
      </Panel>

      <Panel eyebrow="Мои записи" title="Управление приёмами">
        {loading ? (
          <p className="muted-text">Загрузка записей...</p>
        ) : appointments.length === 0 ? (
          <p className="muted-text">У врача пока нет назначенных записей.</p>
        ) : (
          <div className="list-grid">
            {appointments.map((appointment) => {
              const patient = patientsById[appointment.patient_id];
              const isFinished = appointment.progress !== "Назначен";

              return (
                <article className="record-card" key={appointment.id}>
                  <div className="record-head">
                    <div>
                      <h3>{patient ? personName(patient) : appointment.patient_id}</h3>
                      <p>{formatDateTime(appointment.start_time)}</p>
                    </div>
                    <span className="status-chip">{appointment.progress}</span>
                  </div>

                  <dl className="record-meta">
                    <div>
                      <dt>Email</dt>
                      <dd>{patient?.email ?? "Нет данных"}</dd>
                    </div>
                    <div>
                      <dt>Телефон</dt>
                      <dd>{patient?.phone ?? "Нет данных"}</dd>
                    </div>
                    <div>
                      <dt>Комментарий пациента</dt>
                      <dd>{appointment.patient_notes || "Не указан"}</dd>
                    </div>
                  </dl>

                  <TextareaField
                    label="Заметки врача"
                    onChange={(event) =>
                      setNoteDrafts((current) => ({
                        ...current,
                        [appointment.id]: event.target.value,
                      }))
                    }
                    placeholder="Итог консультации"
                    value={noteDrafts[appointment.id] ?? ""}
                  />

                  <div className="button-row">
                    <button
                      className="primary-button"
                      disabled={isFinished || !(noteDrafts[appointment.id] ?? "").trim()}
                      onClick={() => {
                        void (async () => {
                          try {
                            await api.post<AppointmentInfo>("/appointments/complete", {
                              appointment_id: appointment.id,
                              doctor_notes: noteDrafts[appointment.id],
                            });
                            setMessage("Приём завершён.");
                            await loadData();
                          } catch (error) {
                            setRequestError(error instanceof Error ? error.message : "Не удалось завершить приём.");
                          }
                        })();
                      }}
                      type="button"
                    >
                      Завершить
                    </button>
                    <button
                      className="secondary-button"
                      disabled={isFinished}
                      onClick={() => {
                        void (async () => {
                          try {
                            await api.post<boolean>("/appointments/cancel", {
                              appointment_id: appointment.id,
                            });
                            setMessage("Приём отменён.");
                            await loadData();
                          } catch (error) {
                            setRequestError(error instanceof Error ? error.message : "Не удалось отменить приём.");
                          }
                        })();
                      }}
                      type="button"
                    >
                      Отменить
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </Panel>

      <Panel eyebrow="Реестр пациентов" title="users/patients/get">
        <div className="directory-table">
          <div className="directory-row directory-row-head">
            <span>Пациент</span>
            <span>Email</span>
            <span>Телефон</span>
            <span>Дата рождения</span>
          </div>
          {patients.map((patient) => (
            <div className="directory-row" key={patient.id}>
              <span>{personName(patient)}</span>
              <span>{patient.email}</span>
              <span>{patient.phone || "Не указан"}</span>
              <span>{patient.birth_date.slice(0, 10)}</span>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
};
