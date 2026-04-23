import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { TextareaField } from "../components/FormControls";
import { Panel } from "../components/Panel";
import { formatDateTime, personName } from "../lib/format";
import { useRootStore } from "../stores/storeContext";

export const DoctorDashboard = observer(() => {
  const { data } = useRootStore();
  const [message, setMessage] = useState<string | null>(null);
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [requestError, setRequestError] = useState<string | null>(null);

  useEffect(() => {
    void data.loadDashboardData();
  }, [data]);

  useEffect(() => {
    setNoteDrafts(
      data.appointments.reduce<Record<string, string>>((accumulator, appointment) => {
        accumulator[appointment.id] = appointment.doctor_notes ?? "";
        return accumulator;
      }, {}),
    );
  }, [data.appointments]);

  const pageError = requestError ?? data.requestError;

  return (
    <div className="dashboard-grid">
      {pageError ? <div className="notice notice-error">{pageError}</div> : null}
      {message ? <div className="notice notice-success">{message}</div> : null}

      <Panel eyebrow="Приемы" title="Список записей">
        {data.loading ? (
          <p className="muted-text">Загрузка записей...</p>
        ) : data.appointments.length === 0 ? (
          <p className="muted-text">Назначенных записей пока нет.</p>
        ) : (
          <div className="list-grid">
            {data.appointments.map((appointment) => {
              const patient = data.patientsById[appointment.patient_id];
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
                            await data.completeAppointment(appointment.id, noteDrafts[appointment.id]);
                            setMessage("Прием завершен.");
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
                            setRequestError(null);
                            await data.cancelAppointment(appointment.id);
                            setMessage("Прием отменен.");
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
});
