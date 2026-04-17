import { Panel } from "../components/Panel";
import { visitPreparation } from "../lib/content";

export const ContactsPage = () => (
  <div className="page-shell">
    <section className="page-intro">
      <p className="hero-kicker">Контакты</p>
      <h1>Как нас найти и что подготовить к приему.</h1>
      <p className="hero-text">
        Здесь собраны адрес, график работы, способы связи и краткая памятка перед визитом.
      </p>
    </section>

    <section className="contact-grid">
      <Panel title="Адрес и режим работы">
        <div className="info-stack">
          <p>
            <strong>Адрес:</strong> Москва, ул. Клиническая, 12
          </p>
          <p>
            <strong>Телефон:</strong> +7 (495) 555-24-24
          </p>
          <p>
            <strong>Email:</strong> info@medcab.local
          </p>
          <p>
            <strong>Пн-Пт:</strong> 09:00-19:00
          </p>
          <p>
            <strong>Сб:</strong> 10:00-15:00
          </p>
        </div>
      </Panel>

      <Panel title="Перед приемом">
        <ul className="feature-list compact-list">
          {visitPreparation.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Panel>
    </section>
  </div>
);
