import { Panel } from "../components/Panel";

const services = [
  "Первичная консультация травматолога-ортопеда",
  "Повторные приёмы и контроль восстановления",
  "Просмотр медицинской карточки и истории визитов",
  "Онлайн-запись и контроль статусов приёмов",
];

export const ServicesPage = () => (
  <div className="page-shell">
    <section className="page-intro">
      <p className="hero-kicker">Услуги</p>
      <h1>Основные возможности системы.</h1>
      <p className="hero-text">
        Host объединяет весь пользовательский сценарий, а выбранный microfrontend показывает соответствующую
        реализацию кабинета.
      </p>
    </section>

    <section className="card-grid">
      {services.map((service) => (
        <Panel key={service} title={service}>
          <p className="muted-text">
            Функционал доступен после входа в систему и одинаково поддерживается в реализации на Redux и на MobX.
          </p>
        </Panel>
      ))}
    </section>
  </div>
);
