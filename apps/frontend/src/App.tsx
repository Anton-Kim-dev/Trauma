import { useMemo, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { createApiClient } from "./lib/api";
import { clearSessionStorage, createSession, loadSession, persistSession } from "./lib/session";
import { AdminDashboard } from "./pages/AdminDashboard";
import { AuthPage } from "./pages/AuthPage";
import { DoctorDashboard } from "./pages/DoctorDashboard";
import { PatientDashboard } from "./pages/PatientDashboard";
import type { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse, SessionState } from "./types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

const roleTitle: Record<"P" | "D" | "A", string> = {
  A: "Администратор",
  D: "Врач",
  P: "Пациент",
};

const App = () => {
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [session, setSession] = useState<SessionState | null>(() => loadSession());

  const api = useMemo(
    () =>
      createApiClient(API_BASE_URL, {
        clear: () => {
          setSession(null);
          clearSessionStorage();
        },
        get: () => session,
        save: (nextSession) => {
          setSession(nextSession);
          persistSession(nextSession);
        },
      }),
    [session],
  );

  const handleLogin = async (payload: LoginRequest) => {
    setAuthBusy(true);
    setAuthError(null);

    try {
      const response = await api.post<LoginResponse>("/auth/login", payload, {
        retryOnAuth: false,
        skipAuth: true,
      });
      const nextSession = createSession(response.access_token, response.refresh_token);
      if (!nextSession) throw new Error("Backend вернул некорректный access token.");

      setSession(nextSession);
      persistSession(nextSession);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Не удалось выполнить вход.");
    } finally {
      setAuthBusy(false);
    }
  };

  const handleRegister = async (payload: RegisterRequest) => {
    setAuthBusy(true);
    setAuthError(null);

    try {
      const response = await api.post<RegisterResponse>("/auth/register", payload, {
        retryOnAuth: false,
        skipAuth: true,
      });

      if (response.result !== 0) {
        throw new Error(
          response.result === 1
            ? "Пользователь с таким логином уже существует."
            : "Backend не смог завершить регистрацию.",
        );
      }

      await handleLogin({
        password: payload.password,
        username: payload.username,
      });
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Не удалось зарегистрировать пациента.");
    } finally {
      setAuthBusy(false);
    }
  };

  const handleLogout = async () => {
    if (session?.refreshToken) {
      try {
        await api.post<void>(
          "/auth/logout",
          { token: session.refreshToken },
          {
            retryOnAuth: false,
            skipAuth: true,
          },
        );
      } catch {
        // Локальный выход должен отработать даже если logout на backend завершился ошибкой.
      }
    }

    setSession(null);
    clearSessionStorage();
  };

  const dashboard = session ? (
    <>
      <header className="app-header">
        <div>
          <p className="hero-kicker">Trauma Team / Operational UI</p>
          <h1 className="header-title">{roleTitle[session.user.user_role]}</h1>
          <p className="header-subtitle">
            Пользователь <code>{session.user.user_name}</code> работает через backend-контракты без моков и
            лишних страниц.
          </p>
        </div>
        <div className="header-actions">
          <a className="link-button" href="/docs" rel="noreferrer" target="_blank">
            Swagger docs
          </a>
          <button className="secondary-button" onClick={() => void handleLogout()} type="button">
            Выйти
          </button>
        </div>
      </header>

      {session.user.user_role === "P" ? <PatientDashboard api={api} session={session} /> : null}
      {session.user.user_role === "D" ? <DoctorDashboard api={api} session={session} /> : null}
      {session.user.user_role === "A" ? <AdminDashboard api={api} /> : null}
    </>
  ) : (
    <AuthPage busy={authBusy} error={authError} onLogin={handleLogin} onRegister={handleRegister} />
  );

  return (
    <Routes>
      <Route
        element={
          <div className="app-shell">
            <div className="app-shell-inner">{dashboard}</div>
          </div>
        }
        path="/"
      />
      <Route element={<Navigate replace to="/" />} path="*" />
    </Routes>
  );
};

export default App;
