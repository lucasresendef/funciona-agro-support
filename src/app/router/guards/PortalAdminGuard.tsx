import { useAuth } from "@/modules/auth/AuthContext";
import { isPortalAdmin } from "@/shared/config/permissions";
import { routes } from "@/shared/config/routes";
import { Navigate, Outlet } from "react-router-dom";

export function PortalAdminGuard() {
  const { profile } = useAuth();
  if (!isPortalAdmin(profile)) return <Navigate to={routes.accessDenied} replace />;
  return <Outlet />;
}
