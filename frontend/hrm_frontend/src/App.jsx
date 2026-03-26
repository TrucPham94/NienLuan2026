import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import EmployeePage from "./pages/EmployeePage";
import DepartmentPage from "./pages/DepartmentPage";
import ContractPage from "./pages/ContractPage";
import SalaryPage from "./pages/SalaryPage";
import Layout from "./components/Layout";

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Đang tải...</div>;
  return user ? children : <Navigate to="/login" />;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="employees" element={<EmployeePage />} />
          <Route path="departments" element={<DepartmentPage />} />
          <Route path="contracts" element={<ContractPage />} />
          <Route path="salaries" element={<SalaryPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
