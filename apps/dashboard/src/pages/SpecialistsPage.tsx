import { NavLink } from "react-router-dom";
import { Panel } from "../components/Panel";
import { clinicDoctors } from "../lib/content";

export const SpecialistsPage = () => (
  <div className="page-shell">
    <section className="page-intro">
      <p className="hero-kicker">Специалисты</p>
      <h1>Команда кабинета для консультаций, наблюдения и восстановления.</h1>
      <p className="hero-text">
        Здесь пациент знакомится с профилем врачей, а точное расписание и доступные слоты видит уже после входа в
        личный кабинет.
      </p>
    </section>

    <section className="card-grid">
      {clinicDoctors.map((doctor) => (
        <article className="simple-card" key={doctor.name}>
          <span>{doctor.profile}</span>
          <strong>{doctor.name}</strong>
          <p className="muted-text">{doctor.summary}</p>
          <ul className="feature-list compact-list">
            <li>{doctor.experience}</li>
            <li>{doctor.schedule}</li>
          </ul>
        </article>
      ))}
    </section>

    <Panel eyebrow="Для пациента" title="Запись к специалисту">
      <p className="muted-text">
        После авторизации вы увидите доступных врачей, сможете выбрать дату и время и сразу оформить запись на прием.
      </p>
      <div className="hero-actions">
        <NavLink className="primary-button" to="/cabinet">
          Открыть личный кабинет
        </NavLink>
      </div>
    </Panel>
  </div>
);
