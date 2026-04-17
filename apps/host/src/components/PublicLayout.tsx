import { NavLink, Outlet } from "react-router-dom";

const navigation = [
  { label: "Главная", to: "/" },
  { label: "Услуги", to: "/services" },
  { label: "Специалисты", to: "/specialists" },
  { label: "Контакты", to: "/contacts" },
];

export const PublicLayout = () => (
  <div className="app-shell">
    <div className="app-shell-inner">
      <header className="site-header">
        <div className="site-brand">
          <NavLink className="site-logo" to="/">
            Травматологический кабинет
          </NavLink>
          <p className="site-subtitle">
            Host-приложение объединяет две frontend-реализации кабинета пациента: на Redux и на MobX.
          </p>
        </div>

        <nav className="site-nav">
          {navigation.map((item) => (
            <NavLink
              className={({ isActive }) => (isActive ? "site-nav-link is-active" : "site-nav-link")}
              key={item.to}
              to={item.to}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <NavLink className="primary-button" to="/cabinet/redux">
          Личный кабинет
        </NavLink>
      </header>

      <main className="site-main">
        <Outlet />
      </main>

      <footer className="site-footer">
        <div>
          <strong>Trauma Host</strong>
          <p>Единая оболочка для двух микрофронтендов, подключённых через Module Federation.</p>
        </div>
        <div>
          <strong>Контакты</strong>
          <p>Москва, ул. Клиническая, 12</p>
          <p>+7 (495) 555-24-24</p>
        </div>
        <div>
          <strong>Режим работы</strong>
          <p>Пн-Пт: 09:00-19:00</p>
          <p>Сб: 10:00-15:00</p>
        </div>
      </footer>
    </div>
  </div>
);
