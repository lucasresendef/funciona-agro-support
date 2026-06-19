import { keycloak } from "@/shared/lib/auth/keycloak";
import type { AxiosError, AxiosInstance } from "axios";
import { ApiError } from "./api-error";

export function installInterceptors(api: AxiosInstance) {
  api.interceptors.request.use(async (config) => {
    if (keycloak.authenticated) {
      try {
        await keycloak.updateToken(30);
      } catch {
        await keycloak.login();
      }
      if (keycloak.token) {
        config.headers.Authorization = `Bearer ${keycloak.token}`;
      }
    }
    return config;
  });

  api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<{ message?: string; details?: unknown }>) => {
      const status = error.response?.status;

      throw new ApiError({
        statusCode: status ?? 500,
        message: error.response?.data?.message ?? error.message ?? "Erro desconhecido",
        details: error.response?.data?.details,
      });
    },
  );
}
