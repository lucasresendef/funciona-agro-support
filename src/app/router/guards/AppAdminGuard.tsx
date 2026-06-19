import { useAuth } from "@/modules/auth/AuthContext";
import { isAppAdmin } from "@/shared/config/permissions";
import { routes } from "@/shared/config/routes";
import { Navigate, Outlet } from "react-router-dom";

export function AppAdminGuard() {
  const { profile } = useAuth();
  if (!isAppAdmin(profile)) return <Navigate to={routes.accessDenied} replace />;
  return <Outlet />;
}
