import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute, RoleRoute } from "./components/ProtectedRoute";
import AppShell from "./layouts/AppShell";
import LoginPage from "./pages/LoginPage";
import ApplyLeavePage from "./pages/ApplyLeavePage";
import MyApplicationsPage from "./pages/MyApplicationsPage";
import ApprovalQueuePage from "./pages/ApprovalQueuePage";
import RegisterEmployeePage from "./pages/RegisterEmployeePage";
import DepartmentsPage from "./pages/DepartmentsPage";
import PublicHolidaysPage from "./pages/PublicHolidaysPage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppShell />}>
              <Route index element={<Navigate to="/apply" replace />} />
              <Route path="apply" element={<ApplyLeavePage />} />
              <Route path="my-applications" element={<MyApplicationsPage />} />
              <Route element={<RoleRoute roles={["manager", "owner"]} />}>
                <Route path="approvals" element={<ApprovalQueuePage />} />
                <Route path="register" element={<RegisterEmployeePage />} />
                <Route path="departments" element={<DepartmentsPage />} />
                <Route
                  path="public-holidays"
                  element={<PublicHolidaysPage />}
                />
              </Route>
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/apply" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
