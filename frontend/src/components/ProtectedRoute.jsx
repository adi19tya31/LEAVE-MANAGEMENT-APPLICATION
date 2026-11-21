import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

export function RoleRoute({ roles }) {
  const { user } = useAuth();
  const applicationRoles = user?.applicationRoles;
  const isAuthorized = Array.isArray(applicationRoles)
    ? roles.some((role) => applicationRoles.includes(role))
    : roles.includes(user?.role);
  return isAuthorized ? (
    <Outlet />
  ) : (
    <Navigate to="/apply" replace />
  );
}
