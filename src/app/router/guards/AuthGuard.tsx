import { useAuth } from "@/modules/auth/AuthContext";
import { routes } from "@/shared/config/routes";
import { Navigate, Outlet } from "react-router-dom";

export function AuthGuard() {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div className="p-6">Carregando...</div>;
  if (!isAuthenticated) return <Navigate to={routes.login} replace />;
  return <Outlet />;
}
