import { routes } from "@/shared/config/routes";
import { ApiError } from "@/shared/lib/http/api-error";
import type { NavigateFunction } from "react-router-dom";
import { toast } from "sonner";

export function handleSecurityError(error: unknown, navigate: NavigateFunction): boolean {
  if (!(error instanceof ApiError)) return false;

  if (error.statusCode === 401) {
    toast.error("Sua sessão expirou. Faça login novamente.");
    navigate(routes.login);
    return true;
  }

  if (error.statusCode === 403) {
    toast.error("Você não tem permissão para acessar este recurso.");
    navigate(routes.accessDenied);
    return true;
  }

  return false;
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) return error.message;
  return fallback;
}
