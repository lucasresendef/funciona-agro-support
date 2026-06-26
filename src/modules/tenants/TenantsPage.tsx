import { supportTenantsApi } from "@/modules/tenants/support-tenants.api";
import type { TenantListItemDto } from "@/modules/tenants/contracts/support-tenants.dto";
import { queryKeys } from "@/shared/config/query-keys";
import { routes } from "@/shared/config/routes";
import { getApiErrorMessage, handleSecurityError } from "@/shared/lib/http/security";
import { formatDatePtBr } from "@/shared/lib/utils/date";
import { AppButton } from "@/shared/ui/components/AppButton";
import { AppCard } from "@/shared/ui/components/AppCard";
import { AppDialog } from "@/shared/ui/components/AppDialog";
import { AppSelect } from "@/shared/ui/components/AppSelect";
import { ConfirmDialog } from "@/shared/ui/components/ConfirmDialog";
import { EmptyState } from "@/shared/ui/components/EmptyState";
import { PaginationControls } from "@/shared/ui/components/PaginationControls";
import { PageHeader } from "@/shared/ui/components/PageHeader";
import { RefreshIconButton } from "@/shared/ui/components/RefreshIconButton";
import { TableIconButton } from "@/shared/ui/components/TableIconButton";
import { usePaginationState } from "@/shared/lib/hooks/usePaginationState";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Eye, Pencil, Plus, RotateCcw, Search, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const inputClassName = "h-10 rounded-[var(--radius-md)] border bg-white px-3 text-sm";

type TenantStatusFilter = "all" | "active" | "inactive";

export function TenantsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pagination = usePaginationState();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TenantStatusFilter>("all");
  const [editingTenant, setEditingTenant] = useState<TenantListItemDto | null>(null);
  const [tenantKey, setTenantKey] = useState("");
  const [tenantName, setTenantName] = useState("");
  const [tenantToDeactivate, setTenantToDeactivate] = useState<TenantListItemDto | null>(null);

  const filters = useMemo(
    () => ({
      search: search.trim() || undefined,
      active: statusFilter === "all" ? undefined : statusFilter === "active",
      page: pagination.page,
      limit: pagination.limit,
    }),
    [pagination.limit, pagination.page, search, statusFilter],
  );

  const tenantsQuery = useQuery({
    queryKey: [...queryKeys.supportTenants, filters],
    queryFn: () => supportTenantsApi.listTenants(filters),
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (tenantsQuery.error) handleSecurityError(tenantsQuery.error, navigate);
  }, [navigate, tenantsQuery.error]);

  async function invalidateTenants() {
    await queryClient.invalidateQueries({ queryKey: queryKeys.supportTenants });
  }

  function onMutationError(error: unknown, fallback: string) {
    if (handleSecurityError(error, navigate)) return;
    toast.error(getApiErrorMessage(error, fallback));
  }

  function startEditTenant(tenant: TenantListItemDto) {
    setEditingTenant(tenant);
    setTenantKey(tenant.key);
    setTenantName(tenant.name);
  }

  function closeEditTenantDialog() {
    setEditingTenant(null);
    setTenantKey("");
    setTenantName("");
  }

  const updateTenantMutation = useMutation({
    mutationFn: () => {
      if (!editingTenant) throw new Error("Nenhum tenant selecionado.");
      return supportTenantsApi.updateTenant(editingTenant.id, {
        key: tenantKey.trim(),
        name: tenantName.trim(),
      });
    },
    onSuccess: async () => {
      await invalidateTenants();
      closeEditTenantDialog();
      toast.success("Tenant atualizado com sucesso");
    },
    onError: (error) => onMutationError(error, "Falha ao atualizar tenant"),
  });

  const deactivateTenantMutation = useMutation({
    mutationFn: (tenantId: string) => supportTenantsApi.deactivateTenant(tenantId),
    onSuccess: async () => {
      await invalidateTenants();
      setTenantToDeactivate(null);
      toast.success("Tenant inativado com sucesso");
    },
    onError: (error) => onMutationError(error, "Falha ao inativar tenant"),
  });

  const toggleTenantStatusMutation = useMutation({
    mutationFn: (payload: { tenantId: string; active: boolean }) =>
      supportTenantsApi.updateTenant(payload.tenantId, { active: payload.active }),
    onSuccess: async () => {
      await invalidateTenants();
      toast.success("Status do tenant atualizado");
    },
    onError: (error) => onMutationError(error, "Falha ao atualizar status do tenant"),
  });

  const tenants = tenantsQuery.data?.data ?? [];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Tenants"
        subtitle="Gerencie clientes, usuários e a estrutura de cada operação"
        breadcrumb="Operações / Tenants"
        actions={
          <div className="flex items-center gap-2">
            <RefreshIconButton
              onClick={() => tenantsQuery.refetch()}
              disabled={tenantsQuery.isFetching}
            />
            <Link to={routes.tenantsNew}>
              <AppButton type="button">
                <Plus size={16} className="mr-1" />
                Novo tenant
              </AppButton>
            </Link>
          </div>
        }
      />

      <AppCard className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px_auto] md:items-center">
        <label className="relative block">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--foreground-muted))]"
          />
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              pagination.resetPage();
            }}
            placeholder="Buscar por nome ou key"
            className={`${inputClassName} w-full pl-9`}
          />
        </label>
        <AppSelect
          value={statusFilter}
          onValueChange={(value) => {
            setStatusFilter(value as TenantStatusFilter);
            pagination.resetPage();
          }}
          options={[
            { value: "all", label: "Todos os status" },
            { value: "active", label: "Ativos" },
            { value: "inactive", label: "Inativos" },
          ]}
        />
        <div className="flex justify-start md:justify-end">
          <AppButton
            type="button"
            variant="secondary"
            className="h-10 px-4"
            onClick={() => {
              setSearch("");
              setStatusFilter("all");
            }}
          >
            Limpar filtros
          </AppButton>
        </div>
      </AppCard>

      {tenantsQuery.isError ? (
        <EmptyState
          title="Erro ao carregar tenants"
          description="Não foi possível buscar a listagem de tenants no momento."
        />
      ) : tenants.length === 0 ? (
        <EmptyState
          title="Nenhum tenant cadastrado"
          description="Crie um tenant para organizar usuários, fazendas e permissões por cliente."
          actionLabel="Novo tenant"
          onAction={() => navigate(routes.tenantsNew)}
        />
      ) : (
        <>
          <AppCard className="overflow-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[hsl(var(--surface-muted))]">
                <tr>
                  <th className="px-3 py-2">Nome</th>
                  <th className="px-3 py-2">Key</th>
                  <th className="px-3 py-2">Usuários</th>
                  <th className="px-3 py-2">Fazendas</th>
                  <th className="px-3 py-2">Atualizado em</th>
                  <th className="px-3 py-2 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {tenants.map((tenant) => (
                  <tr key={tenant.id} className="border-t">
                    <td className="px-3 py-3 font-medium text-[hsl(var(--brand-dark))]">
                      {tenant.name}
                    </td>
                    <td className="px-3 py-3">{tenant.key}</td>
                    <td className="px-3 py-3">{tenant.stats.users}</td>
                    <td className="px-3 py-3">{tenant.stats.farms}</td>
                    <td className="px-3 py-3">{formatDatePtBr(tenant.updatedAt)}</td>
                    <td className="px-3 py-3">
                      <div className="flex justify-end gap-2">
                        <TableIconButton
                          aria-label={`Abrir ${tenant.name}`}
                          onClick={() =>
                            navigate(routes.tenantDetail.replace(":tenantId", tenant.id))
                          }
                        >
                          <Eye size={16} />
                        </TableIconButton>
                        <TableIconButton
                          aria-label={`Editar ${tenant.name}`}
                          onClick={() => startEditTenant(tenant)}
                        >
                          <Pencil size={16} />
                        </TableIconButton>
                        {tenant.active ? (
                          <TableIconButton
                            aria-label={`Inativar ${tenant.name}`}
                            variant="danger"
                            disabled={deactivateTenantMutation.isPending}
                            onClick={() => setTenantToDeactivate(tenant)}
                          >
                            <Trash2 size={16} />
                          </TableIconButton>
                        ) : (
                          <TableIconButton
                            aria-label={`Reativar ${tenant.name}`}
                            disabled={toggleTenantStatusMutation.isPending}
                            onClick={() =>
                              toggleTenantStatusMutation.mutate({
                                tenantId: tenant.id,
                                active: true,
                              })
                            }
                          >
                            <RotateCcw size={16} />
                          </TableIconButton>
                        )}
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
            total={tenantsQuery.data?.total ?? 0}
            totalPages={tenantsQuery.data?.totalPages ?? 0}
            onPageChange={pagination.setPage}
            onLimitChange={pagination.setLimit}
          />
        </>
      )}

      <AppDialog
        open={editingTenant !== null}
        onOpenChange={(open) => {
          if (!open) closeEditTenantDialog();
        }}
        title="Editar tenant"
        description="Use o mesmo formulário para ajustar key e nome do tenant."
        footer={
          <>
            <AppButton type="button" variant="ghost" onClick={closeEditTenantDialog}>
              Cancelar
            </AppButton>
            <AppButton
              type="button"
              disabled={updateTenantMutation.isPending}
              onClick={() => {
                if (!tenantKey.trim() || !tenantName.trim()) {
                  toast.error("Informe key e nome do tenant");
                  return;
                }
                updateTenantMutation.mutate();
              }}
            >
              <Check size={16} className="mr-1" />
              {updateTenantMutation.isPending ? "Salvando..." : "Salvar tenant"}
            </AppButton>
          </>
        }
      >
        <div className="grid gap-3">
          <input
            value={tenantKey}
            onChange={(event) => setTenantKey(event.target.value)}
            placeholder="Key do tenant"
            className={inputClassName}
          />
          <input
            value={tenantName}
            onChange={(event) => setTenantName(event.target.value)}
            placeholder="Nome do tenant"
            className={inputClassName}
          />
        </div>
      </AppDialog>

      <ConfirmDialog
        open={Boolean(tenantToDeactivate)}
        onOpenChange={(open) => {
          if (!open) setTenantToDeactivate(null);
        }}
        title="Inativar tenant"
        description={`O tenant "${tenantToDeactivate?.name ?? ""}" ficará indisponível para operação, mantendo o histórico.`}
        confirmLabel="Inativar tenant"
        isPending={deactivateTenantMutation.isPending}
        onConfirm={() => {
          if (!tenantToDeactivate) return;
          deactivateTenantMutation.mutate(tenantToDeactivate.id);
        }}
      />
    </div>
  );
}
