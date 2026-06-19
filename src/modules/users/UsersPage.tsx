import { UsersManager, type UsersManagerApi } from "@/modules/users/components/UsersManager";
import { queryKeys } from "@/shared/config/query-keys";
import { api } from "@/shared/lib/http/api-client";
import { type BackendPaginatedResponse, toAppPaginated } from "@/shared/types/api";
import type { AppUserEntity } from "@/shared/types/auth";
import { PageHeader } from "@/shared/ui/components/PageHeader";
import { RefreshIconButton } from "@/shared/ui/components/RefreshIconButton";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const usersApi: UsersManagerApi = {
  create: (input) => api.post("/users", input),
  update: (userId, input) => api.patch(`/users/${userId}`, input),
  resetPassword: (userId, password) => api.post(`/users/${userId}/reset-password`, { password }),
};

export function UsersPage() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [...queryKeys.users, { page: 1, limit: 100 }],
    queryFn: async () => {
      const res = await api.get<BackendPaginatedResponse<AppUserEntity>>("/users", {
        params: { page: 1, limit: 100 },
      });
      return toAppPaginated(res.data);
    },
  });

  const users = (query.data?.data ?? []).map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin,
    active: user.active,
    createdAt: user.createdAt,
  }));

  return (
    <div className="space-y-4">
      <PageHeader
        title="Usuários"
        subtitle="Controle de contas administrativas e operacionais"
        breadcrumb="Operações / Usuários"
        actions={<RefreshIconButton onClick={() => query.refetch()} disabled={query.isFetching} />}
      />

      <UsersManager
        users={users}
        isLoading={query.isLoading}
        onChanged={() => queryClient.invalidateQueries({ queryKey: queryKeys.users })}
        api={usersApi}
      />
    </div>
  );
}
