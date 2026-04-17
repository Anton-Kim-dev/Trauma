import { NavLink } from "react-router-dom";

export const HomePage = () => (
  <div className="page-shell">
    <section className="hero">
      <div className="hero-main">
        <p className="hero-kicker">Лабораторная работа №4</p>
        <h1>Host-приложение подключает две реализации кабинета пациента как микрофронтенды.</h1>
        <p className="hero-text">
          Внутри одного интерфейса можно переключаться между версиями на Redux и MobX, сохраняя авторизацию, общий
          header/footer и единый вход в систему.
        </p>
        <div className="hero-actions">
          <NavLink className="primary-button" to="/cabinet/redux">
            Открыть Redux microfrontend
          </NavLink>
          <NavLink className="secondary-button" to="/cabinet/mobx">
            Открыть MobX microfrontend
          </NavLink>
        </div>
      </div>

      <aside className="hero-side">
        <div className="meta-card">
          <span>Host</span>
          <strong>Авторизация, public-страницы и навигация между remote-app</strong>
        </div>
        <div className="meta-card">
          <span>Remote 1</span>
          <strong>Кабинет на Redux Toolkit</strong>
        </div>
        <div className="meta-card">
          <span>Remote 2</span>
          <strong>Кабинет на MobX</strong>
        </div>
      </aside>
    </section>
  </div>
);
