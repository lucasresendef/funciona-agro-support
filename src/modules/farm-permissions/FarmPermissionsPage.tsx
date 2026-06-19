import { adminOperationsApi } from "@/modules/admin/admin-operations.api";
import type { FarmPermissionListEntity } from "@/modules/admin/contracts/admin-operations.dto";
import type { AppUserEntity, FarmEntity, FarmUserRole } from "@/shared/types/auth";
import { queryKeys } from "@/shared/config/query-keys";
import { getApiErrorMessage } from "@/shared/lib/http/security";
import { AppButton } from "@/shared/ui/components/AppButton";
import { AppCard } from "@/shared/ui/components/AppCard";
import { AppDialog } from "@/shared/ui/components/AppDialog";
import { ConfirmDialog } from "@/shared/ui/components/ConfirmDialog";
import { EmptyState } from "@/shared/ui/components/EmptyState";
import { PaginationControls } from "@/shared/ui/components/PaginationControls";
import { PageHeader } from "@/shared/ui/components/PageHeader";
import { RefreshIconButton } from "@/shared/ui/components/RefreshIconButton";
import { TableIconButton } from "@/shared/ui/components/TableIconButton";
import { usePaginationState } from "@/shared/lib/hooks/usePaginationState";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const ROLES: FarmUserRole[] = ["OWNER", "MANAGER", "OPERATOR", "VIEWER"];
const inputClassName = "h-10 rounded-[var(--radius-md)] border bg-white px-3 text-sm";

export function FarmPermissionsPage() {
  const queryClient = useQueryClient();
  const pagination = usePaginationState();
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | null>(null);
  const [targetPermission, setTargetPermission] = useState<FarmPermissionListEntity | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<FarmPermissionListEntity | null>(null);
  const [farmId, setFarmId] = useState("");
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState<FarmUserRole>("VIEWER");
  const [active, setActive] = useState(true);

  const permissionsQuery = useQuery({
    queryKey: [...queryKeys.farmPermissions, pagination.pagination],
    queryFn: () => adminOperationsApi.listPermissions(pagination.pagination),
    placeholderData: keepPreviousData,
  });

  const farmsQuery = useQuery({
    queryKey: [...queryKeys.farms, { page: 1, limit: 100, active: true }],
    queryFn: () => adminOperationsApi.listFarms({ page: 1, limit: 100, active: true }),
    enabled: dialogMode === "create",
  });

  const usersQuery = useQuery({
    queryKey: [...queryKeys.users, "active-options"],
    queryFn: () => adminOperationsApi.listUsers(),
    enabled: dialogMode === "create",
  });

  async function invalidatePermissions() {
    await queryClient.invalidateQueries({ queryKey: queryKeys.farmPermissions });
  }

  function onError(error: unknown, fallback: string) {
    toast.error(getApiErrorMessage(error, fallback));
  }

  function openCreateDialog() {
    setTargetPermission(null);
    setFarmId("");
    setUserId("");
    setRole("VIEWER");
    setActive(true);
    setDialogMode("create");
  }

  function openEditDialog(permission: FarmPermissionListEntity) {
    setTargetPermission(permission);
    setFarmId(permission.farmId);
    setUserId("");
    setRole(permission.role);
    setActive(permission.active);
    setDialogMode("edit");
  }

  function closeDialog() {
    setDialogMode(null);
    setTargetPermission(null);
  }

  const createMutation = useMutation({
    mutationFn: () =>
      adminOperationsApi.createPermission({
        farmId,
        userId,
        role,
      }),
    onSuccess: async () => {
      await invalidatePermissions();
      closeDialog();
      toast.success("Permissão criada com sucesso");
    },
    onError: (error) => onError(error, "Falha ao criar permissão"),
  });

  const updateMutation = useMutation({
    mutationFn: () => {
      if (!targetPermission) throw new Error("Nenhuma permissão selecionada.");
      return adminOperationsApi.updatePermission(targetPermission.id, {
        role,
        active,
      });
    },
    onSuccess: async () => {
      await invalidatePermissions();
      closeDialog();
      toast.success("Permissão atualizada com sucesso");
    },
    onError: (error) => onError(error, "Falha ao atualizar permissão"),
  });

  const deactivateMutation = useMutation({
    mutationFn: (permissionId: string) => adminOperationsApi.deactivatePermission(permissionId),
    onSuccess: async () => {
      await invalidatePermissions();
      setConfirmTarget(null);
      toast.success("Permissão inativada com sucesso");
    },
    onError: (error) => onError(error, "Falha ao inativar permissão"),
  });

  const permissions = permissionsQuery.data?.data ?? [];
  const farms = farmsQuery.data?.data ?? [];
  const users = usersQuery.data ?? [];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Permissões de Fazenda"
        subtitle="Controle de acesso por usuário e papel"
        breadcrumb="Operações / Permissões"
        actions={
          <div className="flex items-center gap-2">
            <RefreshIconButton
              onClick={() => {
                void queryClient.invalidateQueries({ queryKey: queryKeys.farmPermissions });
                void queryClient.invalidateQueries({ queryKey: queryKeys.farms });
                void queryClient.invalidateQueries({ queryKey: queryKeys.users });
              }}
              disabled={
                permissionsQuery.isFetching || farmsQuery.isFetching || usersQuery.isFetching
              }
            />
            <AppButton type="button" onClick={openCreateDialog}>
              Nova permissão
            </AppButton>
          </div>
        }
      />

      {permissionsQuery.isError ? (
        <EmptyState
          title="Erro ao carregar permissões"
          description="Não foi possível carregar a listagem."
        />
      ) : permissions.length === 0 ? (
        <EmptyState
          title="Nenhuma permissão cadastrada"
          description="Vincule usuários às fazendas para liberar operações com segurança."
          actionLabel="Nova permissão"
          onAction={openCreateDialog}
        />
      ) : (
        <>
          <AppCard className="overflow-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[hsl(var(--surface-muted))]">
              <tr>
                <th className="px-3 py-2">Usuário</th>
                <th className="px-3 py-2">E-mail</th>
                <th className="px-3 py-2">Fazenda</th>
                <th className="px-3 py-2">Papel</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {permissions.map((permission) => (
                <tr key={permission.id} className="border-t">
                  <td className="px-3 py-2">{permission.userName}</td>
                  <td className="px-3 py-2">{permission.userEmail}</td>
                  <td className="px-3 py-2">{permission.farm.name}</td>
                  <td className="px-3 py-2">{permission.role}</td>
                  <td className="px-3 py-2">{permission.active ? "Ativa" : "Inativa"}</td>
                  <td className="px-3 py-2">
                    <div className="flex justify-end gap-2">
                      <TableIconButton
                        aria-label={`Editar permissão de ${permission.userName}`}
                        onClick={() => openEditDialog(permission)}
                      >
                        <Pencil size={16} />
                      </TableIconButton>
                      <TableIconButton
                        aria-label={`Inativar permissão de ${permission.userName}`}
                        variant="danger"
                        disabled={deactivateMutation.isPending}
                        onClick={() => setConfirmTarget(permission)}
                      >
                        <Trash2 size={16} />
                      </TableIconButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </AppCard>

          <PaginationControls
            page={pagination.page}
            limit={pagination.limit}
            total={permissionsQuery.data?.total ?? 0}
            totalPages={permissionsQuery.data?.totalPages ?? 0}
            onPageChange={pagination.setPage}
            onLimitChange={pagination.setLimit}
          />
        </>
      )}

      <AppDialog
        open={dialogMode !== null}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
        title={dialogMode === "edit" ? "Editar permissão" : "Nova permissão"}
        description="O mesmo diálogo atende criação e ajuste de papéis por fazenda."
        footer={
          <>
            <AppButton type="button" variant="ghost" onClick={closeDialog}>
              Cancelar
            </AppButton>
            <AppButton
              type="button"
              disabled={createMutation.isPending || updateMutation.isPending}
              onClick={() => {
                if (dialogMode === "create" && (!farmId || !userId)) {
                  toast.error("Selecione usuário e fazenda");
                  return;
                }
                if (dialogMode === "edit") {
                  updateMutation.mutate();
                  return;
                }
                createMutation.mutate();
              }}
            >
              {createMutation.isPending || updateMutation.isPending
                ? "Salvando..."
                : dialogMode === "edit"
                  ? "Salvar permissão"
                  : "Criar permissão"}
            </AppButton>
          </>
        }
      >
        <div className="grid gap-3">
          {dialogMode === "create" ? (
            <>
              <select
                value={userId}
                onChange={(event) => setUserId(event.target.value)}
                className={inputClassName}
              >
                <option value="">Selecione o usuário</option>
                {users.map((user: AppUserEntity) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
              <select
                value={farmId}
                onChange={(event) => setFarmId(event.target.value)}
                className={inputClassName}
              >
                <option value="">Selecione a fazenda</option>
                {farms.map((farm: FarmEntity) => (
                  <option key={farm.id} value={farm.id}>
                    {farm.name}
                  </option>
                ))}
              </select>
            </>
          ) : (
            <div className="rounded-[var(--radius-md)] border bg-[hsl(var(--surface-muted))] px-4 py-3 text-sm text-[hsl(var(--foreground-muted))]">
              {targetPermission?.userName} na fazenda {targetPermission?.farm.name}
            </div>
          )}
          <select
            value={role}
            onChange={(event) => setRole(event.target.value as FarmUserRole)}
            className={inputClassName}
          >
            {ROLES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {dialogMode === "edit" ? (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={active}
                onChange={(event) => setActive(event.target.checked)}
              />
              Permissão ativa
            </label>
          ) : null}
        </div>
      </AppDialog>

      <ConfirmDialog
        open={Boolean(confirmTarget)}
        onOpenChange={(open) => {
          if (!open) setConfirmTarget(null);
        }}
        title="Inativar permissão"
        description={`A permissão de "${confirmTarget?.userName ?? ""}" na fazenda "${confirmTarget?.farm.name ?? ""}" será removida da operação ativa.`}
        confirmLabel="Inativar permissão"
        isPending={deactivateMutation.isPending}
        onConfirm={() => {
          if (!confirmTarget) return;
          deactivateMutation.mutate(confirmTarget.id);
        }}
      />
    </div>
  );
}
