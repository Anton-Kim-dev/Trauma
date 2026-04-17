import { useEffect } from "react";
import { observer } from "mobx-react-lite";
import { Panel } from "./components/Panel";
import { AdminDashboard } from "./pages/AdminDashboard";
import { DoctorDashboard } from "./pages/DoctorDashboard";
import { PatientDashboard } from "./pages/PatientDashboard";
import { RootStore } from "./stores/rootStore";
import { StoreProvider, useRootStore } from "./stores/storeContext";
import type { SessionState } from "./types";
import "./index.css";

type MobxRemoteAppProps = {
  session: SessionState | null;
};

const rootStore = new RootStore("/api");

const roleTitles: Record<"P" | "D" | "A", string> = {
  A: "Администратор",
  D: "Врач",
  P: "Пациент",
};

const MobxRemoteContent = observer(({ session }: MobxRemoteAppProps) => {
  const { auth, data } = useRootStore();

  useEffect(() => {
    if (!session) {
      auth.clearSession();
      return;
    }

    auth.setSession(session);
    data.clear();
  }, [auth, data, session]);

  if (!session) {
    return (
      <Panel eyebrow="MobX remote" title="Сессия не найдена">
        <p className="muted-text">Авторизуйтесь в host-приложении, чтобы открыть кабинет на MobX.</p>
      </Panel>
    );
  }

  return (
    <div className="dashboard-grid">
      <Panel eyebrow="MobX remote" title="Версия кабинета на MobX">
        <p className="muted-text">
          Активная роль: <strong>{roleTitles[session.user.user_role]}</strong>. Этот модуль встроен в host через Module
          Federation.
        </p>
      </Panel>

      {session.user.user_role === "P" ? <PatientDashboard /> : null}
      {session.user.user_role === "D" ? <DoctorDashboard /> : null}
      {session.user.user_role === "A" ? <AdminDashboard /> : null}
    </div>
  );
});

const MobxRemoteApp = ({ session }: MobxRemoteAppProps) => (
  <StoreProvider store={rootStore}>
    <MobxRemoteContent session={session} />
  </StoreProvider>
);

export default MobxRemoteApp;
