import { Panel } from "../components/Panel";

export const ContactsPage = () => (
  <div className="page-shell">
    <section className="page-intro">
      <p className="hero-kicker">Контакты</p>
      <h1>Как нас найти и как подготовиться к визиту.</h1>
      <p className="hero-text">
        Авторизация и переключение между microfrontend реализованы в host-приложении, поэтому пользователь всегда
        остаётся в единой оболочке.
      </p>
    </section>

    <section className="split-grid">
      <Panel title="Адрес и режим работы">
        <div className="info-stack">
          <p>
            <strong>Адрес:</strong> Москва, ул. Клиническая, 12
          </p>
          <p>
            <strong>Телефон:</strong> +7 (495) 555-24-24
          </p>
          <p>
            <strong>Пн-Пт:</strong> 09:00-19:00
          </p>
        </div>
      </Panel>
      <Panel title="Что взять с собой">
        <ul className="feature-list">
          <li>Паспорт и полис, если требуется идентификация.</li>
          <li>Предыдущие заключения и результаты обследований.</li>
          <li>Краткое описание жалоб для заполнения медицинской карточки.</li>
        </ul>
      </Panel>
    </section>
  </div>
);
