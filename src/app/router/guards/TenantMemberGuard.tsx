import { useAuth } from "@/modules/auth/AuthContext";
import { isTenantMember } from "@/shared/config/permissions";
import { routes } from "@/shared/config/routes";
import { Navigate, Outlet } from "react-router-dom";

export function TenantMemberGuard() {
  const { profile } = useAuth();
  if (!isTenantMember(profile)) return <Navigate to={routes.accessDenied} replace />;
  return <Outlet />;
}
