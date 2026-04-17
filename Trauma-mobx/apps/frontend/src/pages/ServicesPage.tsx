import { NavLink } from "react-router-dom";
import { Panel } from "../components/Panel";
import { clinicServices, clinicSteps } from "../lib/content";

export const ServicesPage = () => (
  <div className="page-shell">
    <section className="page-intro">
      <p className="hero-kicker">Услуги кабинета</p>
      <h1>Основные направления приема и наблюдения.</h1>
      <p className="hero-text">
        Выберите подходящее направление консультации и затем перейдите в личный кабинет для записи на удобное время.
      </p>
    </section>

    <section className="card-grid">
      {clinicServices.map((service) => (
        <Panel key={service.title} title={service.title}>
          <p className="muted-text">{service.description}</p>
          <ul className="feature-list compact-list">
            {service.features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        </Panel>
      ))}
    </section>

    <section className="content-section">
      <div className="section-heading">
        <p className="hero-kicker">Запись</p>
        <h2>Как попасть на прием</h2>
      </div>
      <div className="steps-grid">
        {clinicSteps.map((step) => (
          <article className="step-card" key={step.title}>
            <strong>{step.title}</strong>
            <p className="muted-text">{step.description}</p>
          </article>
        ))}
      </div>
    </section>

    <Panel eyebrow="Личный кабинет" title="Запись доступна онлайн">
      <p className="muted-text">
        После входа пациент видит список врачей из системы, выбирает дату и время, а затем отслеживает все свои
        записи в одном месте.
      </p>
      <div className="hero-actions">
        <NavLink className="primary-button" to="/cabinet">
          Перейти в кабинет
        </NavLink>
      </div>
    </Panel>
  </div>
);
