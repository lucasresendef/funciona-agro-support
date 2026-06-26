import { AnimatePresence } from "framer-motion";
import { useAuth } from "@/modules/auth/AuthContext";
import { routes } from "@/shared/config/routes";
import { LoadingSplashScreen } from "@/shared/ui/components/LoadingSplashScreen";
import { Navigate, Outlet } from "react-router-dom";

export function AuthGuard() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading ? <LoadingSplashScreen key="auth-loading-splash" /> : null}
      </AnimatePresence>
      {!isLoading && (!isAuthenticated ? <Navigate to={routes.login} replace /> : <Outlet />)}
    </>
  );
}
