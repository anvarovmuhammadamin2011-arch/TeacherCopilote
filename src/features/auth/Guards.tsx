import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/stores/useAuth";
export function HomeRedirect() {
  const { user, postLoginPath } = useAuth();
  return (
    <Navigate
      replace
      to={user?.role === "teacher" ? postLoginPath || "/teacher" : "/login"}
    />
  );
}
export function ProtectedRoute() {
  return useAuth((s) => s.isAuthenticated && s.user?.role === "teacher") ? (
    <Outlet />
  ) : (
    <Navigate to="/login" replace />
  );
}
export function PublicRoute() {
  return useAuth((s) => s.user?.role === "teacher") ? (
    <HomeRedirect />
  ) : (
    <Outlet />
  );
}
