import { useEffect, useMemo, useState } from "react";
import { TextareaField } from "../components/FormControls";
import { Panel } from "../components/Panel";
import { formatDateTime, personName } from "../lib/format";
import { getErrorMessage } from "../lib/queryError";
import {
  useCancelAppointmentMutation,
  useCompleteAppointmentMutation,
  useGetAppointmentsQuery,
  useGetPatientsQuery,
} from "../store/apiSlice";
import type { PatientInfo } from "../types";

export const DoctorDashboard = () => {
  const { data: appointments = [], error: appointmentsError, isLoading: appointmentsLoading } = useGetAppointmentsQuery();
  const { data: patients = [], error: patientsError, isLoading: patientsLoading } = useGetPatientsQuery();
  const [cancelAppointment] = useCancelAppointmentMutation();
  const [completeAppointment] = useCompleteAppointmentMutation();
  const [message, setMessage] = useState<string | null>(null);
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [requestError, setRequestError] = useState<string | null>(null);
  const loading = appointmentsLoading || patientsLoading;
  const queryError =
    getErrorMessage(appointmentsError, "Не удалось загрузить записи врача.") ||
    getErrorMessage(patientsError, "Не удалось загрузить пациентов.");

  const patientsById = useMemo(
    () =>
      patients.reduce<Record<string, PatientInfo>>((accumulator, patient) => {
        accumulator[patient.id] = patient;
        return accumulator;
      }, {}),
    [patients],
  );

  useEffect(() => {
    setNoteDrafts((current) =>
      appointments.reduce<Record<string, string>>((accumulator, appointment) => {
        accumulator[appointment.id] = current[appointment.id] ?? appointment.doctor_notes ?? "";
        return accumulator;
      }, {}),
    );
  }, [appointments]);

  return (
    <div className="dashboard-grid">
      {queryError || requestError ? <div className="notice notice-error">{requestError || queryError}</div> : null}
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
                            setRequestError(null);
                            await completeAppointment({
                              appointment_id: appointment.id,
                              doctor_notes: noteDrafts[appointment.id],
                            }).unwrap();
                            setMessage("Прием завершен.");
                          } catch (error) {
                            setRequestError(getErrorMessage(error, "Не удалось завершить прием."));
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
                            setRequestError(null);
                            await cancelAppointment({
                              appointment_id: appointment.id,
                            }).unwrap();
                            setMessage("Прием отменен.");
                          } catch (error) {
                            setRequestError(getErrorMessage(error, "Не удалось отменить прием."));
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
