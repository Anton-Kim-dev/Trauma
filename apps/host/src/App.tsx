import { lazy, Suspense, type ReactNode, useState } from "react";
import { Navigate, NavLink, Route, Routes } from "react-router-dom";
import { PublicLayout } from "./components/PublicLayout";
import { logoutRequest, loginRequest, registerRequest } from "./lib/api";
import { loadSession } from "./lib/session";
import { AuthPage } from "./pages/AuthPage";
import { ContactsPage } from "./pages/ContactsPage";
import { HomePage } from "./pages/HomePage";
import { ServicesPage } from "./pages/ServicesPage";
import { SpecialistsPage } from "./pages/SpecialistsPage";
import type { LoginRequest, RegisterRequest, SessionState } from "./types";

const ReduxRemoteApp = lazy(() => import("reduxApp/ReduxRemoteApp"));
const MobxRemoteApp = lazy(() => import("mobxApp/MobxRemoteApp"));

const roleTitles: Record<"P" | "D" | "A", string> = {
  A: "Администратор",
  D: "Врач",
  P: "Пациент",
};

const CabinetShell = ({
  children,
  onLogout,
  session,
}: {
  children: ReactNode;
  onLogout: () => Promise<void>;
  session: SessionState;
}) => (
  <div className="app-shell app-shell-compact">
    <div className="app-shell-inner">
      <div className="page-shell">
        <header className="app-header">
          <div>
            <p className="hero-kicker">Host-оболочка</p>
            <h1 className="header-title">{roleTitles[session.user.user_role]}</h1>
            <p className="header-subtitle">
              Пользователь <code>{session.user.user_name}</code> может переключаться между двумя frontend-реализациями.
            </p>
          </div>
          <div className="header-actions">
            <button className="secondary-button" onClick={() => void onLogout()} type="button">
              Выйти
            </button>
          </div>
        </header>

        <nav className="microfrontend-nav">
          <NavLink className={({ isActive }) => (isActive ? "mf-link is-active" : "mf-link")} to="/cabinet/redux">
            Redux microfrontend
          </NavLink>
          <NavLink className={({ isActive }) => (isActive ? "mf-link is-active" : "mf-link")} to="/cabinet/mobx">
            MobX microfrontend
          </NavLink>
        </nav>

        <Suspense fallback={<div className="panel"><p className="muted-text">Загрузка microfrontend...</p></div>}>
          {children}
        </Suspense>
      </div>
    </div>
  </div>
);

const App = () => {
  const [session, setSession] = useState<SessionState | null>(() => loadSession());
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  async function handleLogin(payload: LoginRequest) {
    setAuthBusy(true);
    setAuthError(null);

    try {
      const nextSession = await loginRequest(payload);
      setSession(nextSession);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Не удалось выполнить вход.");
    } finally {
      setAuthBusy(false);
    }
  }

  async function handleRegister(payload: RegisterRequest) {
    setAuthBusy(true);
    setAuthError(null);

    try {
      const nextSession = await registerRequest(payload);
      setSession(nextSession);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Не удалось завершить регистрацию.");
    } finally {
      setAuthBusy(false);
    }
  }

  async function handleLogout() {
    await logoutRequest(session);
    setSession(null);
    setAuthError(null);
  }

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
          session ? <Navigate replace to="/cabinet/redux" /> : <AuthPage busy={authBusy} error={authError} onLogin={handleLogin} onRegister={handleRegister} />
        }
        path="/auth"
      />

      <Route
        element={
          session ? (
            <CabinetShell onLogout={handleLogout} session={session}>
              <ReduxRemoteApp session={session} />
            </CabinetShell>
          ) : (
            <Navigate replace to="/auth" />
          )
        }
        path="/cabinet/redux"
      />

      <Route
        element={
          session ? (
            <CabinetShell onLogout={handleLogout} session={session}>
              <MobxRemoteApp session={session} />
            </CabinetShell>
          ) : (
            <Navigate replace to="/auth" />
          )
        }
        path="/cabinet/mobx"
      />

      <Route element={<Navigate replace to="/cabinet/redux" />} path="/cabinet" />
      <Route element={<Navigate replace to="/" />} path="*" />
    </Routes>
  );
};

export default App;
