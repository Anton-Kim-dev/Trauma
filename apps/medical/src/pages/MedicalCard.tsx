import { useEffect, useMemo } from "react";
import { observer } from "mobx-react-lite";
import { Panel } from "../components/Panel";
import { formatDate, formatDateTime, personName } from "../lib/format";
import { useRootStore } from "../stores/storeContext";

const fallbackValue = "Не указано";

const MedicalCard = observer(() => {
  const { auth, data } = useRootStore();

  useEffect(() => {
    void data.loadDashboardData();
  }, [data]);

  const patient = data.currentPatient;
  const timeline = useMemo(
    () =>
      data.appointments
        .slice()
        .sort((left, right) => new Date(right.start_time).getTime() - new Date(left.start_time).getTime()),
    [data.appointments],
  );

  const upcomingAppointment = timeline.find((appointment) => new Date(appointment.start_time).getTime() >= Date.now()) ?? null;
  const finishedAppointments = timeline.filter((appointment) => appointment.progress !== "Назначен");
  const lastFinishedAppointment = finishedAppointments[0] ?? null;

  return (
    <div className="dashboard-grid medical-card-page">
      {data.requestError ? <div className="notice notice-error">{data.requestError}</div> : null}

      <section className="medical-card-hero">
        <div className="medical-card-banner">
          <p className="hero-kicker">Медицинская карточка</p>
          <h2 className="panel-title">{patient ? personName(patient) : auth.currentUser?.user_name ?? "Пациент"}</h2>
          <p className="hero-text">
            Карточка собирает профиль пациента, текущие контакты и историю приемов с комментариями врачей.
          </p>
        </div>

        <div className="medical-card-metrics">
          <article className="metric-card">
            <span>Следующий прием</span>
            <strong>{upcomingAppointment ? formatDateTime(upcomingAppointment.start_time) : "Пока не назначен"}</strong>
          </article>
          <article className="metric-card">
            <span>Последнее заключение</span>
            <strong>{lastFinishedAppointment ? formatDateTime(lastFinishedAppointment.start_time) : "История еще не заполнена"}</strong>
          </article>
          <article className="metric-card">
            <span>Всего визитов</span>
            <strong>{timeline.length}</strong>
          </article>
        </div>
      </section>

      <div className="medical-card-grid">
        <Panel eyebrow="Профиль" title="Данные пациента">
          {data.loading && !patient ? (
            <p className="muted-text">Загрузка медицинской карточки...</p>
          ) : (
            <dl className="medical-card-details">
              <div>
                <dt>ФИО</dt>
                <dd>{patient ? personName(patient) : fallbackValue}</dd>
              </div>
              <div>
                <dt>Дата рождения</dt>
                <dd>{patient?.birth_date ? formatDate(patient.birth_date) : fallbackValue}</dd>
              </div>
              <div>
                <dt>Пол</dt>
                <dd>{patient?.gender === "M" ? "Мужской" : patient?.gender === "F" ? "Женский" : fallbackValue}</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>{patient?.email ?? fallbackValue}</dd>
              </div>
              <div>
                <dt>Телефон</dt>
                <dd>{patient?.phone ?? fallbackValue}</dd>
              </div>
              <div>
                <dt>Создана в системе</dt>
                <dd>{patient?.created_at ? formatDate(patient.created_at) : fallbackValue}</dd>
              </div>
            </dl>
          )}
        </Panel>

        <Panel eyebrow="Статус" title="Краткая сводка">
          <div className="medical-summary-list">
            <article className="simple-card">
              <span>Следующий визит</span>
              <strong>{upcomingAppointment ? formatDateTime(upcomingAppointment.start_time) : "Записей нет"}</strong>
              <p className="muted-text">
                {upcomingAppointment
                  ? data.doctorsById[upcomingAppointment.doctor_id]
                    ? `${personName(data.doctorsById[upcomingAppointment.doctor_id])}, ${data.doctorsById[upcomingAppointment.doctor_id].specialty}`
                    : "Специалист будет определен при загрузке"
                  : "Создайте запись в кабинете, чтобы прием появился в карточке."}
              </p>
            </article>
            <article className="simple-card">
              <span>Последние заметки врача</span>
              <strong>{lastFinishedAppointment?.doctor_notes ? "Есть заключение" : "Нет заключения"}</strong>
              <p className="muted-text">{lastFinishedAppointment?.doctor_notes ?? "После завершения приема комментарий врача появится здесь."}</p>
            </article>
          </div>
        </Panel>
      </div>

      <Panel eyebrow="История" title="Хронология обращений">
        {data.loading && timeline.length === 0 ? (
          <p className="muted-text">Загрузка визитов...</p>
        ) : timeline.length === 0 ? (
          <p className="muted-text">История обращений пока пуста.</p>
        ) : (
          <div className="timeline-list">
            {timeline.map((appointment) => {
              const doctor = data.doctorsById[appointment.doctor_id];

              return (
                <article className="timeline-item" key={appointment.id}>
                  <div className="timeline-item-head">
                    <div>
                      <h3>{formatDateTime(appointment.start_time)}</h3>
                      <p>{doctor ? `${personName(doctor)} · ${doctor.specialty}` : "Специалист загружается"}</p>
                    </div>
                    <span className="status-chip">{appointment.progress}</span>
                  </div>
                  <dl className="record-meta">
                    <div>
                      <dt>Причина обращения</dt>
                      <dd>{appointment.patient_notes || "Комментарий пациента отсутствует"}</dd>
                    </div>
                    <div>
                      <dt>Заключение врача</dt>
                      <dd>{appointment.doctor_notes || "Заключение будет добавлено после приема"}</dd>
                    </div>
                  </dl>
                </article>
              );
            })}
          </div>
        )}
      </Panel>
    </div>
  );
});

export default MedicalCard;
