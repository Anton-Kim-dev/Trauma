import { NavLink } from "react-router-dom";

export const HomePage = () => (
  <div className="page-shell">
    <section className="hero">
      <div className="hero-main">
        <p className="hero-kicker">Частный медицинский кабинет</p>
        <h1>Консультации по травмам и суставам без лишней бюрократии.</h1>
        <p className="hero-text">
          Консультации, наблюдение и запись на прием в удобном личном кабинете пациента.
        </p>
        <div className="hero-actions">
          <NavLink className="primary-button" to="/cabinet">
            Записаться на прием
          </NavLink>
          <NavLink className="secondary-button" to="/services">
            Посмотреть услуги
          </NavLink>
        </div>
        <div className="hero-facts">
          <div className="hero-fact">
            <span>Формат работы</span>
            <strong>По предварительной записи</strong>
          </div>
          <div className="hero-fact">
            <span>Личный кабинет</span>
            <strong>Запись и история визитов</strong>
          </div>
          <div className="hero-fact">
            <span>График</span>
            <strong>Пн-Пт 09:00-19:00</strong>
          </div>
        </div>
      </div>
    </section>
  </div>
);
