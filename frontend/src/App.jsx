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
import CompOffApprovalPage from "./pages/CompOffApprovalPage";
import CompOffPage from "./pages/CompOffPage";
import DashboardPage from "./pages/DashboardPage";
import EmployeesPage from "./pages/EmployeesPage";
import LeaveCalendarPage from "./pages/LeaveCalendarPage";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import VerifyOtpPage from "./pages/VerifyOtpPage";


export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/verify-otp" element={<VerifyOtpPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          
          <Route element={<ProtectedRoute />}>
            <Route element={<AppShell />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="change-password" element={<ChangePasswordPage />} />
              <Route path="apply" element={<ApplyLeavePage />} />
              <Route path="my-applications" element={<MyApplicationsPage />} />
              <Route path="comp-off" element={<CompOffPage />} />
              <Route element={<RoleRoute roles={["manager", "owner"]} />}>
                <Route path="employees" element={<EmployeesPage />} />
                <Route path="leave-calendar" element={<LeaveCalendarPage />} />
                <Route path="approvals" element={<ApprovalQueuePage />} />
                <Route
                  path="comp-off-approvals"
                  element={<CompOffApprovalPage />}
                />
                <Route path="register" element={<RegisterEmployeePage />} />
                <Route path="departments" element={<DepartmentsPage />} />
                <Route
                  path="public-holidays"
                  element={<PublicHolidaysPage />}
                />
              </Route>
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
