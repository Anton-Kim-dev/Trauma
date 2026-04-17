import { useEffect } from "react";
import { observer } from "mobx-react-lite";
import { Navigate, Route, Routes } from "react-router-dom";
import { PublicLayout } from "./components/PublicLayout";
import { personName } from "./lib/format";
import { AdminDashboard } from "./pages/AdminDashboard";
import { AuthPage } from "./pages/AuthPage";
import { ContactsPage } from "./pages/ContactsPage";
import { DoctorDashboard } from "./pages/DoctorDashboard";
import { HomePage } from "./pages/HomePage";
import { PatientDashboard } from "./pages/PatientDashboard";
import { ServicesPage } from "./pages/ServicesPage";
import { SpecialistsPage } from "./pages/SpecialistsPage";
import { useRootStore } from "./stores/storeContext";
import type { DoctorInfo, PatientInfo } from "./types";

const roleTitle: Record<"P" | "D" | "A", string> = {
  A: "Администратор",
  D: "Врач",
  P: "Пациент",
};

const isPatientInfo = (value: PatientInfo | DoctorInfo | null): value is PatientInfo =>
  Boolean(value && "email" in value);

const UserInfoBlock = observer(() => {
  const { auth, data } = useRootStore();
  const user = auth.currentUser;
  const userInfo = data.currentUserInfo;

  if (!user) return null;

  return (
    <div className="header-user-card">
      <p className="header-user-label">Информация о пользователе</p>
      <strong>{userInfo ? personName(userInfo) : user.user_name}</strong>
      <span>{userInfo && "specialty" in userInfo ? userInfo.specialty : roleTitle[user.user_role]}</span>
      {isPatientInfo(userInfo) ? <span>{userInfo.email}</span> : null}
    </div>
  );
});

const App = observer(() => {
  const { auth, data } = useRootStore();
  const session = auth.session;

  useEffect(() => {
    if (session) {
      void data.loadCurrentUserInfo();
    }
  }, [data, session]);

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
          <UserInfoBlock />
          <button className="secondary-button" onClick={() => void auth.logout()} type="button">
            Выйти
          </button>
        </div>
      </header>

      {session.user.user_role === "P" ? <PatientDashboard /> : null}
      {session.user.user_role === "D" ? <DoctorDashboard /> : null}
      {session.user.user_role === "A" ? <AdminDashboard /> : null}
    </>
  ) : (
    <AuthPage busy={auth.authBusy} error={auth.authError} onLogin={auth.login} onRegister={auth.register} />
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
            <AuthPage busy={auth.authBusy} error={auth.authError} onLogin={auth.login} onRegister={auth.register} />
          )
        }
        path="cabinet"
      />
      <Route element={<Navigate replace to="/" />} path="*" />
    </Routes>
  );
});

export default App;
