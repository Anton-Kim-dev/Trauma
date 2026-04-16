import { useMemo, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { PublicLayout } from "./components/PublicLayout";
import { createApiClient } from "./lib/api";
import { clearSessionStorage, createSession, loadSession, persistSession } from "./lib/session";
import { AdminDashboard } from "./pages/AdminDashboard";
import { AuthPage } from "./pages/AuthPage";
import { ContactsPage } from "./pages/ContactsPage";
import { DoctorDashboard } from "./pages/DoctorDashboard";
import { HomePage } from "./pages/HomePage";
import { PatientDashboard } from "./pages/PatientDashboard";
import { ServicesPage } from "./pages/ServicesPage";
import { SpecialistsPage } from "./pages/SpecialistsPage";
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
      if (!nextSession) throw new Error("Сервер вернул некорректный access token.");

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
            : "Не удалось завершить регистрацию.",
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
        // Локальный выход должен отработать даже если logout завершился ошибкой.
      }
    }

    setSession(null);
    clearSessionStorage();
  };

  const cabinetContent = session ? (
    <>
      <header className="app-header">
        <div>
          <p className="hero-kicker">Личный кабинет</p>
          <h1 className="header-title">{roleTitle[session.user.user_role]}</h1>
          <p className="header-subtitle">
            Пользователь <code>{session.user.user_name}</code>
          </p>
        </div>
        <div className="header-actions">
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
      <Route element={<PublicLayout />} path="/">
        <Route element={<HomePage />} index />
        <Route element={<ServicesPage />} path="services" />
        <Route element={<SpecialistsPage />} path="specialists" />
        <Route element={<ContactsPage />} path="contacts" />
      </Route>
      <Route
        element={
          session ? (
            <div className="app-shell app-shell-compact">
              <div className="app-shell-inner">
                <div className="page-shell">{cabinetContent}</div>
              </div>
            </div>
          ) : (
            <AuthPage busy={authBusy} error={authError} onLogin={handleLogin} onRegister={handleRegister} />
          )
        }
        path="cabinet"
      />
      <Route element={<Navigate replace to="/" />} path="*" />
    </Routes>
  );
};

export default App;
