import React, { Component, lazy, Suspense, useEffect } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { observer } from "mobx-react-lite";
import { Navigate, NavLink, Outlet, Route, Routes } from "react-router-dom";
import { PublicLayout } from "./components/PublicLayout";
import { personName } from "./lib/format";
import { AuthPage } from "./pages/AuthPage";
import { ContactsPage } from "./pages/ContactsPage";
import { HomePage } from "./pages/HomePage";
import { ServicesPage } from "./pages/ServicesPage";
import { SpecialistsPage } from "./pages/SpecialistsPage";
import { useRootStore } from "./stores/storeContext";

const AdminDashboard = lazy(() => import("dashboard/AdminDashboard"));
const DoctorDashboard = lazy(() => import("dashboard/DoctorDashboard"));
const PatientDashboard = lazy(() => import("dashboard/PatientDashboard"));
const MedicalCard = lazy(() => import("medical/MedicalCard"));

const roleTitle: Record<"P" | "D" | "A", string> = {
  A: "Администратор",
  D: "Врач",
  P: "Пациент",
};

class RemoteBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Remote module failed to render", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <section className="panel remote-fallback">
          <p className="panel-eyebrow">Microfrontend</p>
          <h2 className="panel-title">Не удалось загрузить модуль</h2>
          <p className="muted-text">
            Проверьте, что host, dashboard и medical приложения запущены и доступны по ожидаемым адресам.
          </p>
        </section>
      );
    }

    return this.props.children;
  }
}

const activeWorkspaceLink = ({ isActive }: { isActive: boolean }) =>
  isActive ? "workspace-nav-link is-active" : "workspace-nav-link";

const UserInfoBlock = observer(() => {
  const { auth, data } = useRootStore();
  const user = auth.currentUser;
  const userInfo = data.currentUserInfo;

  if (!user) return null;

  return (
    <div className="header-user-card">
      <strong>{userInfo ? personName(userInfo) : user.user_name}</strong>
      <span>{userInfo && "specialty" in userInfo ? userInfo.specialty : roleTitle[user.user_role]}</span>
    </div>
  );
});

const WorkspaceHeader = observer(() => {
  const { auth } = useRootStore();
  const session = auth.session;

  if (!session) return null;

  return (
    <header className="app-header workspace-header">
      <div className="workspace-brand">
        <p className="hero-kicker">Host application</p>
        <h1 className="header-title">Trauma cabinet</h1>
        <p className="header-subtitle">
          Авторизация, глобальная навигация и orchestration microfrontend-приложений собраны в одном shell.
        </p>
      </div>

      <nav className="workspace-nav">
        <NavLink className={activeWorkspaceLink} end to="/cabinet">
          Дашборд
        </NavLink>
        {session.user.user_role === "P" ? (
          <NavLink className={activeWorkspaceLink} to="/cabinet/medical-card">
            Медкарта
          </NavLink>
        ) : null}
        <NavLink className="workspace-nav-link" to="/">
          Публичный сайт
        </NavLink>
      </nav>

      <div className="header-actions">
        <UserInfoBlock />
        <button className="secondary-button" onClick={() => void auth.logout()} type="button">
          Выйти
        </button>
      </div>
    </header>
  );
});

const WorkspaceIntro = observer(() => {
  const { auth, data } = useRootStore();
  const session = auth.session;

  if (!session) return null;

  const currentUserInfo = data.currentUserInfo;

  return (
    <section className="workspace-hero">
      <div className="workspace-hero-main">
        <p className="hero-kicker">Host shell</p>
        <h2>{session.user.user_role === "P" ? "Личный кабинет пациента" : `Рабочее место: ${roleTitle[session.user.user_role]}`}</h2>
        <p className="hero-text">
          Хост управляет сессией, общими layout-компонентами и переключением между remote-модулями dashboard и medical.
        </p>
      </div>

      <div className="workspace-summary">
        <article className="workspace-summary-card">
          <span>Текущий пользователь</span>
          <strong>{currentUserInfo ? personName(currentUserInfo) : session.user.user_name}</strong>
        </article>
        <article className="workspace-summary-card">
          <span>Роль</span>
          <strong>{roleTitle[session.user.user_role]}</strong>
        </article>
        <article className="workspace-summary-card">
          <span>Активных врачей</span>
          <strong>{data.activeDoctors.length}</strong>
        </article>
      </div>
    </section>
  );
});

const WorkspaceFooter = () => (
  <footer className="workspace-footer">
    <p>Trauma microfrontend platform: host, dashboard и medical модули работают через Module Federation и общий API.</p>
  </footer>
);

const RemoteOutlet = ({ children }: { children: ReactNode }) => (
  <RemoteBoundary>
    <Suspense
      fallback={
        <section className="panel loading-panel">
          <p className="panel-eyebrow">Microfrontend</p>
          <h2 className="panel-title">Загрузка модуля</h2>
          <p className="muted-text">Подключаем remote bundle и инициализируем экран...</p>
        </section>
      }
    >
      {children}
    </Suspense>
  </RemoteBoundary>
);

const DashboardRoute = observer(() => {
  const { auth } = useRootStore();
  const role = auth.session?.user.user_role;

  if (role === "A") {
    return (
      <RemoteOutlet>
        <AdminDashboard />
      </RemoteOutlet>
    );
  }

  if (role === "D") {
    return (
      <RemoteOutlet>
        <DoctorDashboard />
      </RemoteOutlet>
    );
  }

  return (
    <RemoteOutlet>
      <PatientDashboard />
    </RemoteOutlet>
  );
});

const CabinetLayout = () => (
  <div className="app-shell app-shell-compact">
    <div className="app-shell-inner site-main">
      <WorkspaceHeader />
      <WorkspaceIntro />
      <section className="module-stage">
        <Outlet />
      </section>
      <WorkspaceFooter />
    </div>
  </div>
);

const CabinetEntry = observer(() => {
  const { auth } = useRootStore();

  if (!auth.session) {
    return <AuthPage busy={auth.authBusy} error={auth.authError} onLogin={auth.login} onRegister={auth.register} />;
  }

  return <CabinetLayout />;
});

const App = observer(() => {
  const { auth, data } = useRootStore();
  const session = auth.session;

  useEffect(() => {
    if (session) {
      void data.loadCurrentUserInfo();
    } else {
      data.clear();
    }
  }, [data, session]);

  return (
    <Routes>
      <Route element={<PublicLayout />} path="/">
        <Route element={<HomePage />} index />
        <Route element={<ServicesPage />} path="services" />
        <Route element={<SpecialistsPage />} path="specialists" />
        <Route element={<ContactsPage />} path="contacts" />
      </Route>

      <Route element={<CabinetEntry />} path="cabinet">
        <Route index element={<DashboardRoute />} />
        <Route
          path="medical-card"
          element={
            auth.session?.user.user_role === "P" ? (
              <RemoteOutlet>
                <MedicalCard />
              </RemoteOutlet>
            ) : (
              <Navigate replace to="/cabinet" />
            )
          }
        />
      </Route>

      <Route element={<Navigate replace to="/" />} path="*" />
    </Routes>
  );
});

export default App;
