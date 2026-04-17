import { useEffect } from "react";
import { Provider } from "react-redux";
import { Panel } from "./components/Panel";
import { AdminDashboard } from "./pages/AdminDashboard";
import { DoctorDashboard } from "./pages/DoctorDashboard";
import { PatientDashboard } from "./pages/PatientDashboard";
import { apiSlice } from "./store/apiSlice";
import { clearCredentials, setCredentials } from "./store/authSlice";
import { store, useAppDispatch } from "./store";
import type { SessionState } from "./types";
import "./index.css";

type ReduxRemoteAppProps = {
  session: SessionState | null;
};

const roleTitles: Record<"P" | "D" | "A", string> = {
  A: "Администратор",
  D: "Врач",
  P: "Пациент",
};

const ReduxRemoteContent = ({ session }: ReduxRemoteAppProps) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(apiSlice.util.resetApiState());

    if (session) {
      dispatch(setCredentials(session));
    } else {
      dispatch(clearCredentials());
    }
  }, [dispatch, session]);

  if (!session) {
    return (
      <Panel eyebrow="Redux remote" title="Сессия не найдена">
        <p className="muted-text">Авторизуйтесь в host-приложении, чтобы открыть кабинет на Redux Toolkit.</p>
      </Panel>
    );
  }

  return (
    <div className="dashboard-grid">
      <Panel eyebrow="Redux remote" title="Версия кабинета на Redux Toolkit">
        <p className="muted-text">
          Активная роль: <strong>{roleTitles[session.user.user_role]}</strong>. Этот модуль встроен в host через Module
          Federation.
        </p>
      </Panel>

      {session.user.user_role === "P" ? <PatientDashboard session={session} /> : null}
      {session.user.user_role === "D" ? <DoctorDashboard /> : null}
      {session.user.user_role === "A" ? <AdminDashboard /> : null}
    </div>
  );
};

const ReduxRemoteApp = ({ session }: ReduxRemoteAppProps) => (
  <Provider store={store}>
    <ReduxRemoteContent session={session} />
  </Provider>
);

export default ReduxRemoteApp;
