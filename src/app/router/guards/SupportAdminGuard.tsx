import { useAuth } from "@/modules/auth/AuthContext";
import { isSupportAdmin } from "@/shared/config/permissions";
import { routes } from "@/shared/config/routes";
import { Navigate, Outlet } from "react-router-dom";

export function SupportAdminGuard() {
  const { profile } = useAuth();
  if (!isSupportAdmin(profile)) return <Navigate to={routes.accessDenied} replace />;
  return <Outlet />;
}
