import { AuthContext } from "@/modules/auth/AuthContext";
import { queryKeys } from "@/shared/config/query-keys";
import { keycloak } from "@/shared/lib/auth/keycloak";
import { api } from "@/shared/lib/http/api-client";
import type { DataWrapper } from "@/shared/types/api";
import type { AuthMeResponse } from "@/shared/types/auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { PropsWithChildren } from "react";
import { useMemo } from "react";

async function fetchMe() {
  await api.post("/auth/sync-user").catch(() => undefined);
  const response = await api.get<DataWrapper<AuthMeResponse>>("/auth/me");
  return response.data.data;
}

export function AuthProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient();
  const isAuthenticated = Boolean(keycloak.authenticated);

  const meQuery = useQuery({
    queryKey: queryKeys.authMe,
    queryFn: fetchMe,
    enabled: isAuthenticated,
  });

  const value = useMemo(
    () => ({
      profile: meQuery.data ?? null,
      isAuthenticated,
      isLoading: isAuthenticated && meQuery.isLoading,
      login: () => keycloak.login(),
      logout: () => keycloak.logout({ redirectUri: window.location.origin }),
      syncUser: async () => {
        await api.post("/auth/sync-user");
        await queryClient.invalidateQueries({ queryKey: queryKeys.authMe });
      },
    }),
    [isAuthenticated, meQuery.data, meQuery.isLoading, queryClient],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
