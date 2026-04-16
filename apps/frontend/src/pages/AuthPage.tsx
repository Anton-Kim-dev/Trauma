import { useState } from "react";
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
  const [formError, setFormError] = useState<string | null>(null);
  const [login, setLogin] = useState<LoginRequest>({ username: "", password: "" });
  const [register, setRegister] = useState<RegisterRequest>(emptyRegister);

  const visibleError = formError ?? error;

  const handleLoginSubmit = () => {
    const username = login.username.trim();
    const password = login.password;

    if (!username || !password) {
      setFormError("Введите логин и пароль.");
      return;
    }

    setFormError(null);
    void onLogin({
      username,
      password,
    });
  };

  const handleRegisterSubmit = () => {
    const payload: RegisterRequest = {
      ...register,
      birth_date: register.birth_date,
      email: register.email.trim(),
      first_name: register.first_name.trim(),
      last_name: register.last_name.trim(),
      password: register.password,
      patronymic: register.patronymic?.trim() || null,
      phone: register.phone?.trim() || null,
      username: register.username.trim(),
    };

    if (payload.username.length < 4) {
      setFormError("Логин должен содержать не менее 4 символов.");
      return;
    }

    if (payload.password.length < 8) {
      setFormError("Пароль должен содержать не менее 8 символов.");
      return;
    }

    if (!payload.first_name || !payload.last_name || !payload.email || !payload.birth_date) {
      setFormError("Заполните обязательные поля формы.");
      return;
    }

    setFormError(null);
    void onRegister(payload);
  };

  return (
    <div className="page-shell">
      <section className="page-intro">
        <p className="hero-kicker">Личный кабинет</p>
        <h1>{mode === "login" ? "Вход в кабинет" : "Регистрация пациента"}</h1>
      </section>

      <section className="auth-grid">
        <Panel
          action={
            <div className="tab-switcher" role="tablist">
              <button
                className={mode === "login" ? "tab-button is-active" : "tab-button"}
                onClick={() => {
                  setFormError(null);
                  setMode("login");
                }}
                type="button"
              >
                Вход
              </button>
              <button
                className={mode === "register" ? "tab-button is-active" : "tab-button"}
                onClick={() => {
                  setFormError(null);
                  setMode("register");
                }}
                type="button"
              >
                Регистрация
              </button>
            </div>
          }
          title={mode === "login" ? "Войти" : "Создать учетную запись"}
        >
          {visibleError ? <div className="notice notice-error">{visibleError}</div> : null}

          {mode === "login" ? (
            <form
              className="form-grid"
              onSubmit={(event) => {
                event.preventDefault();
                handleLoginSubmit();
              }}
            >
              <InputField
                label="Логин"
                minLength={4}
                onChange={(event) => setLogin((current) => ({ ...current, username: event.target.value }))}
                placeholder="Введите логин"
                required
                value={login.username}
              />
              <InputField
                label="Пароль"
                minLength={8}
                onChange={(event) => setLogin((current) => ({ ...current, password: event.target.value }))}
                placeholder="Введите пароль"
                required
                type="password"
                value={login.password}
              />
              <button className="primary-button" disabled={busy} type="submit">
                {busy ? "Входим..." : "Войти"}
              </button>
            </form>
          ) : (
            <form
              className="form-grid form-grid-columns"
              onSubmit={(event) => {
                event.preventDefault();
                handleRegisterSubmit();
              }}
            >
              <InputField
                description="Не менее 4 символов"
                label="Логин"
                minLength={4}
                onChange={(event) => setRegister((current) => ({ ...current, username: event.target.value }))}
                required
                value={register.username}
              />
              <InputField
                description="Не менее 8 символов"
                label="Пароль"
                minLength={8}
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
                    patronymic: event.target.value,
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
                    phone: event.target.value,
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
                {busy ? "Сохраняем..." : "Зарегистрироваться"}
              </button>
            </form>
          )}
        </Panel>
      </section>
    </div>
  );
};
