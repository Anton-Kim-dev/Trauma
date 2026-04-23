import { Navigate, Route, Routes } from "react-router-dom";
import MedicalCardRemote from "./remote/MedicalCardRemote";

const App = () => {
  return (
    <Routes>
      <Route path="/card" element={<MedicalCardRemote />} />
      <Route path="*" element={<Navigate replace to="/card" />} />
    </Routes>
  );
};

export default App;
