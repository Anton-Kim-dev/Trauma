import { useMemo, useState } from "react";
import { InputField, SelectField } from "../components/FormControls";
import { Panel } from "../components/Panel";
import type { LoginRequest, RegisterRequest } from "../types";

type AuthMode = "login" | "register";

type AuthPageProps = {
  busy: boolean;
  error: string | null;
  onLogin: (payload: LoginRequest) => Promise<void>;
  onRegister: (payload: RegisterRequest) => Promise<void>;
};

const emptyRegister: RegisterRequest = {
  birth_date: "",
  email: "",
  first_name: "",
  gender: "M",
  last_name: "",
  password: "",
  patronymic: null,
  phone: null,
  username: "",
};

export const AuthPage = ({ busy, error, onLogin, onRegister }: AuthPageProps) => {
  const [mode, setMode] = useState<AuthMode>("login");
  const [login, setLogin] = useState<LoginRequest>({ username: "", password: "" });
  const [register, setRegister] = useState<RegisterRequest>(emptyRegister);
  const subtitle = useMemo(
    () =>
      mode === "login"
        ? "Вход работает через /api/auth/login и использует реальные JWT access/refresh токены."
        : "Регистрация открыта только для пациента и отправляет точный payload backend-схемы /api/auth/register.",
    [mode],
  );

  return (
    <div className="page-shell">
      <section className="hero">
        <div className="hero-copy">
          <p className="hero-kicker">Trauma Team / Sync Console</p>
          <h1>Frontend, сведённый к текущему backend.</h1>
          <p className="hero-text">
            В интерфейсе оставлены только рабочие сценарии из сервисов auth, users и appointments:
            авторизация, регистрация пациента, справочники, записи и управление профилем.
          </p>
          <div className="hero-chips">
            <span>Auth</span>
            <span>Users</span>
            <span>Appointments</span>
            <span>Role aware</span>
          </div>
        </div>

        <Panel eyebrow="Контракты backend" title="Актуальные сценарии">
          <ul className="feature-list">
            <li>Пациент: регистрация, вход, профиль, список врачей, создание и отмена записи.</li>
            <li>Врач: вход, профиль врача, свои записи, завершение и отмена приёма.</li>
            <li>Админ: вход, общий реестр записей, списки пользователей, создание новых учётных записей.</li>
          </ul>
          <p className="muted-text">{subtitle}</p>
        </Panel>
      </section>

      <section className="auth-grid">
        <Panel
          action={
            <div className="tab-switcher" role="tablist">
              <button
                className={mode === "login" ? "tab-button is-active" : "tab-button"}
                onClick={() => setMode("login")}
                type="button"
              >
                Вход
              </button>
              <button
                className={mode === "register" ? "tab-button is-active" : "tab-button"}
                onClick={() => setMode("register")}
                type="button"
              >
                Регистрация
              </button>
            </div>
          }
          eyebrow="Доступ"
          title={mode === "login" ? "Войти в систему" : "Создать пациента"}
        >
          {error ? <div className="notice notice-error">{error}</div> : null}

          {mode === "login" ? (
            <form
              className="form-grid"
              onSubmit={(event) => {
                event.preventDefault();
                void onLogin(login);
              }}
            >
              <InputField
                label="Логин"
                onChange={(event) => setLogin((current) => ({ ...current, username: event.target.value }))}
                placeholder="Например, p.alekseev"
                required
                value={login.username}
              />
              <InputField
                label="Пароль"
                onChange={(event) => setLogin((current) => ({ ...current, password: event.target.value }))}
                placeholder="Введите пароль"
                required
                type="password"
                value={login.password}
              />
              <button className="primary-button" disabled={busy} type="submit">
                {busy ? "Проверяем..." : "Войти"}
              </button>
            </form>
          ) : (
            <form
              className="form-grid form-grid-columns"
              onSubmit={(event) => {
                event.preventDefault();
                void onRegister(register);
              }}
            >
              <InputField
                label="Логин"
                onChange={(event) => setRegister((current) => ({ ...current, username: event.target.value }))}
                required
                value={register.username}
              />
              <InputField
                label="Пароль"
                onChange={(event) => setRegister((current) => ({ ...current, password: event.target.value }))}
                required
                type="password"
                value={register.password}
              />
              <InputField
                label="Имя"
                onChange={(event) => setRegister((current) => ({ ...current, first_name: event.target.value }))}
                required
                value={register.first_name}
              />
              <InputField
                label="Фамилия"
                onChange={(event) => setRegister((current) => ({ ...current, last_name: event.target.value }))}
                required
                value={register.last_name}
              />
              <InputField
                label="Отчество"
                onChange={(event) =>
                  setRegister((current) => ({
                    ...current,
                    patronymic: event.target.value.trim() || null,
                  }))
                }
                value={register.patronymic ?? ""}
              />
              <InputField
                label="Email"
                onChange={(event) => setRegister((current) => ({ ...current, email: event.target.value }))}
                required
                type="email"
                value={register.email}
              />
              <InputField
                label="Телефон"
                onChange={(event) =>
                  setRegister((current) => ({
                    ...current,
                    phone: event.target.value.trim() || null,
                  }))
                }
                value={register.phone ?? ""}
              />
              <InputField
                label="Дата рождения"
                onChange={(event) => setRegister((current) => ({ ...current, birth_date: event.target.value }))}
                required
                type="date"
                value={register.birth_date}
              />
              <SelectField
                label="Пол"
                onChange={(event) =>
                  setRegister((current) => ({
                    ...current,
                    gender: event.target.value as "M" | "F",
                  }))
                }
                options={[
                  { label: "Мужской", value: "M" },
                  { label: "Женский", value: "F" },
                ]}
                required
                value={register.gender}
              />
              <button className="primary-button" disabled={busy} type="submit">
                {busy ? "Создаём..." : "Зарегистрироваться"}
              </button>
            </form>
          )}
        </Panel>

        <Panel eyebrow="Замечание" title="Что убрано из прежнего UI">
          <ul className="feature-list">
            <li>Маркетинговые страницы, которые не обращались к backend.</li>
            <li>Фальшивые кабинеты, emergency-экраны и демонстрационные макеты без API.</li>
            <li>Всё, что зависело от моков вместо контрактов реальных сервисов.</li>
          </ul>
        </Panel>
      </section>
    </div>
  );
};
