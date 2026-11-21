import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute, RoleRoute } from "./components/ProtectedRoute";
import AppShell from "./layouts/AppShell";
import ApplyLeavePage from "./pages/ApplyLeavePage";
import MyApplicationsPage from "./pages/MyApplicationsPage";
import ApprovalQueuePage from "./pages/ApprovalQueuePage";
import PublicHolidaysPage from "./pages/PublicHolidaysPage";
import CompOffApprovalPage from "./pages/CompOffApprovalPage";
import CompOffPage from "./pages/CompOffPage";
import DashboardPage from "./pages/DashboardPage";
import LeaveCalendarPage from "./pages/LeaveCalendarPage";
import NotificationsPage from "./pages/NotificationsPage";
import LeaveTypeManagement from "./pages/leaveType";



export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Navigate to="/" replace />} />
          
          <Route element={<ProtectedRoute />}>
            <Route element={<AppShell />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="apply" element={<ApplyLeavePage />} />
              <Route path="my-applications" element={<MyApplicationsPage />} />
              <Route path="comp-off" element={<CompOffPage />} />
              
              <Route element={<RoleRoute roles={["manager", "owner"]} />}>
                <Route path="leave-calendar" element={<LeaveCalendarPage />} />
                <Route path="approvals" element={<ApprovalQueuePage />} />
                <Route
                  path="comp-off-approvals"
                  element={<CompOffApprovalPage />}
                />
                <Route path="leave-types" element={<LeaveTypeManagement />} />
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
