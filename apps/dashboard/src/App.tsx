import { Navigate, Route, Routes } from "react-router-dom";
import AdminDashboardRemote from "./remote/AdminDashboardRemote";
import DoctorDashboardRemote from "./remote/DoctorDashboardRemote";
import PatientDashboardRemote from "./remote/PatientDashboardRemote";

const App = () => {
  return (
    <Routes>
      <Route path="/admin" element={<AdminDashboardRemote />} />
      <Route path="/doctor" element={<DoctorDashboardRemote />} />
      <Route path="/patient" element={<PatientDashboardRemote />} />
      <Route path="*" element={<Navigate replace to="/patient" />} />
    </Routes>
  );
};

export default App;
