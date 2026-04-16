import { useEffect, useMemo, useState } from "react";
import { TextareaField } from "../components/FormControls";
import { Panel } from "../components/Panel";
import { formatDateTime, personName } from "../lib/format";
import type { ApiClient, AppointmentInfo, PatientInfo, SessionState } from "../types";

type DoctorDashboardProps = {
  api: ApiClient;
  session: SessionState;
};

export const DoctorDashboard = ({ api }: DoctorDashboardProps) => {
  const [appointments, setAppointments] = useState<AppointmentInfo[]>([]);
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
      const [appointmentList, patientList] = await Promise.all([
        api.get<AppointmentInfo[]>("/appointments/get"),
        api.get<PatientInfo[]>("/users/patients/get"),
      ]);

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

      <Panel eyebrow="Приемы" title="Список записей">
        {loading ? (
          <p className="muted-text">Загрузка записей...</p>
        ) : appointments.length === 0 ? (
          <p className="muted-text">Назначенных записей пока нет.</p>
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
                    label="Заключение врача"
                    onChange={(event) =>
                      setNoteDrafts((current) => ({
                        ...current,
                        [appointment.id]: event.target.value,
                      }))
                    }
                    placeholder="Краткое заключение по приему"
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
                            setMessage("Прием завершен.");
                            await loadData();
                          } catch (error) {
                            setRequestError(error instanceof Error ? error.message : "Не удалось завершить прием.");
                          }
                        })();
                      }}
                      type="button"
                    >
                      Завершить прием
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
                            setMessage("Прием отменен.");
                            await loadData();
                          } catch (error) {
                            setRequestError(error instanceof Error ? error.message : "Не удалось отменить прием.");
                          }
                        })();
                      }}
                      type="button"
                    >
                      Отменить прием
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </Panel>
    </div>
  );
};
