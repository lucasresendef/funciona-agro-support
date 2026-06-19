import { supportTenantsApi } from "@/modules/tenants/support-tenants.api";
import type {
  TenantFarmDto,
  TenantFieldDto,
  TenantPermissionDto,
} from "@/modules/tenants/contracts/support-tenants.dto";
import { UsersManager, type UsersManagerApi } from "@/modules/users/components/UsersManager";
import type { FarmUserRole } from "@/shared/types/auth";
import { queryKeys } from "@/shared/config/query-keys";
import { routes } from "@/shared/config/routes";
import { getApiErrorMessage, handleSecurityError } from "@/shared/lib/http/security";
import { formatDatePtBr } from "@/shared/lib/utils/date";
import { formatBooleanPtBr } from "@/shared/lib/utils/format";
import { AppButton } from "@/shared/ui/components/AppButton";
import { AppCard } from "@/shared/ui/components/AppCard";
import { AppDialog } from "@/shared/ui/components/AppDialog";
import { ConfirmDialog } from "@/shared/ui/components/ConfirmDialog";
import { EmptyState } from "@/shared/ui/components/EmptyState";
import { MetricCard } from "@/shared/ui/components/MetricCard";
import { PageHeader } from "@/shared/ui/components/PageHeader";
import { RefreshIconButton } from "@/shared/ui/components/RefreshIconButton";
import { TableIconButton } from "@/shared/ui/components/TableIconButton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, Check, Leaf, Pencil, Plus, RotateCcw, Trash2, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

const ROLES: FarmUserRole[] = ["OWNER", "MANAGER", "OPERATOR", "VIEWER"];
const inputClassName = "h-10 rounded-[var(--radius-md)] border bg-white px-3 text-sm";
const textareaClassName = "min-h-24 rounded-[var(--radius-md)] border bg-white px-3 py-2 text-sm";
const selectClassName = inputClassName;

type Tab = "users" | "permissions" | "farms" | "fields";

interface EditableField extends TenantFieldDto {
  farmName: string;
  farmId: string;
}

export function TenantDetailPage() {
  const { tenantId = "" } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>("users");

  const [tenantKey, setTenantKey] = useState("");
  const [tenantName, setTenantName] = useState("");
  const [isEditingTenant, setIsEditingTenant] = useState(false);
  const [isDeactivateTenantOpen, setIsDeactivateTenantOpen] = useState(false);

  const [isCreatePermissionOpen, setIsCreatePermissionOpen] = useState(false);
  const [permissionUserId, setPermissionUserId] = useState("");
  const [permissionFarmId, setPermissionFarmId] = useState("");
  const [permissionRole, setPermissionRole] = useState<FarmUserRole>("VIEWER");
  const [editingPermission, setEditingPermission] = useState<TenantPermissionDto | null>(null);
  const [editingPermissionRole, setEditingPermissionRole] = useState<FarmUserRole>("VIEWER");
  const [editingPermissionActive, setEditingPermissionActive] = useState(true);
  const [deactivatePermissionTarget, setDeactivatePermissionTarget] =
    useState<TenantPermissionDto | null>(null);

  const [isCreateFarmOpen, setIsCreateFarmOpen] = useState(false);
  const [farmName, setFarmName] = useState("");
  const [farmDescription, setFarmDescription] = useState("");
  const [editingFarm, setEditingFarm] = useState<TenantFarmDto | null>(null);
  const [editingFarmName, setEditingFarmName] = useState("");
  const [editingFarmDescription, setEditingFarmDescription] = useState("");
  const [editingFarmActive, setEditingFarmActive] = useState(true);
  const [deactivateFarmTarget, setDeactivateFarmTarget] = useState<TenantFarmDto | null>(null);

  const [isCreateFieldOpen, setIsCreateFieldOpen] = useState(false);
  const [fieldFarmId, setFieldFarmId] = useState("");
  const [fieldName, setFieldName] = useState("");
  const [fieldArea, setFieldArea] = useState("0");
  const [fieldDescription, setFieldDescription] = useState("");
  const [editingField, setEditingField] = useState<EditableField | null>(null);
  const [editingFieldName, setEditingFieldName] = useState("");
  const [editingFieldArea, setEditingFieldArea] = useState("0");
  const [editingFieldDescription, setEditingFieldDescription] = useState("");
  const [editingFieldActive, setEditingFieldActive] = useState(true);
  const [deactivateFieldTarget, setDeactivateFieldTarget] = useState<EditableField | null>(null);

  const detailQuery = useQuery({
    queryKey: [...queryKeys.supportTenantDetail, tenantId],
    queryFn: () => supportTenantsApi.getTenant(tenantId),
    enabled: Boolean(tenantId),
  });

  const tenant = detailQuery.data;

  useEffect(() => {
    if (!tenant) return;
    setTenantKey(tenant.key);
    setTenantName(tenant.name);
  }, [tenant]);

  useEffect(() => {
    if (detailQuery.error) handleSecurityError(detailQuery.error, navigate);
  }, [detailQuery.error, navigate]);

  const fieldRows = useMemo<EditableField[]>(
    () =>
      tenant?.farms.flatMap((farm) =>
        farm.fields.map((field) => ({
          ...field,
          farmId: farm.id,
          farmName: farm.name,
        })),
      ) ?? [],
    [tenant],
  );

  const activeUsers = useMemo(() => tenant?.users.filter((user) => user.active) ?? [], [tenant]);
  const activeFarms = useMemo(() => tenant?.farms.filter((farm) => farm.active) ?? [], [tenant]);

  async function invalidateTenant() {
    await queryClient.invalidateQueries({ queryKey: queryKeys.supportTenants });
    await queryClient.invalidateQueries({ queryKey: [...queryKeys.supportTenantDetail, tenantId] });
  }

  function onMutationError(error: unknown, fallback: string) {
    if (handleSecurityError(error, navigate)) return;
    toast.error(getApiErrorMessage(error, fallback));
  }

  const updateTenantMutation = useMutation({
    mutationFn: () =>
      supportTenantsApi.updateTenant(tenantId, {
        key: tenantKey.trim(),
        name: tenantName.trim(),
      }),
    onSuccess: async () => {
      await invalidateTenant();
      setIsEditingTenant(false);
      toast.success("Tenant atualizado com sucesso");
    },
    onError: (error) => onMutationError(error, "Falha ao atualizar tenant"),
  });

  const toggleTenantMutation = useMutation({
    mutationFn: (active: boolean) => supportTenantsApi.updateTenant(tenantId, { active }),
    onSuccess: async () => {
      await invalidateTenant();
      toast.success("Status do tenant atualizado");
    },
    onError: (error) => onMutationError(error, "Falha ao atualizar status do tenant"),
  });

  const tenantUsersApi: UsersManagerApi = useMemo(
    () => ({
      create: (input) => supportTenantsApi.createTenantUser(tenantId, input),
      update: (userId, input) => supportTenantsApi.updateTenantUser(tenantId, userId, input),
      resetPassword: (userId, password) =>
        supportTenantsApi.resetTenantUserPassword(tenantId, userId, { password }),
    }),
    [tenantId],
  );

  const createPermissionMutation = useMutation({
    mutationFn: () =>
      supportTenantsApi.createTenantPermission(tenantId, {
        userId: permissionUserId,
        farmId: permissionFarmId,
        role: permissionRole,
      }),
    onSuccess: async () => {
      await invalidateTenant();
      setIsCreatePermissionOpen(false);
      setPermissionUserId("");
      setPermissionFarmId("");
      setPermissionRole("VIEWER");
      toast.success("Permissão criada com sucesso");
    },
    onError: (error) => onMutationError(error, "Falha ao criar permissão"),
  });

  const updatePermissionMutation = useMutation({
    mutationFn: () => {
      if (!editingPermission) throw new Error("Nenhuma permissão selecionada.");
      return supportTenantsApi.updateTenantPermission(tenantId, editingPermission.id, {
        role: editingPermissionRole,
        active: editingPermissionActive,
      });
    },
    onSuccess: async () => {
      await invalidateTenant();
      setEditingPermission(null);
      setDeactivatePermissionTarget(null);
      toast.success("Permissão atualizada com sucesso");
    },
    onError: (error) => onMutationError(error, "Falha ao atualizar permissão"),
  });

  const togglePermissionStatusMutation = useMutation({
    mutationFn: (payload: { permissionId: string; active: boolean }) =>
      supportTenantsApi.updateTenantPermission(tenantId, payload.permissionId, {
        active: payload.active,
      }),
    onSuccess: async () => {
      await invalidateTenant();
      setDeactivatePermissionTarget(null);
      toast.success("Status da permissão atualizado");
    },
    onError: (error) => onMutationError(error, "Falha ao atualizar status da permissão"),
  });

  const createFarmMutation = useMutation({
    mutationFn: () =>
      supportTenantsApi.createTenantFarm(tenantId, {
        name: farmName.trim(),
        description: farmDescription.trim() || undefined,
      }),
    onSuccess: async () => {
      await invalidateTenant();
      setIsCreateFarmOpen(false);
      setFarmName("");
      setFarmDescription("");
      toast.success("Fazenda criada com sucesso");
    },
    onError: (error) => onMutationError(error, "Falha ao criar fazenda"),
  });

  const updateFarmMutation = useMutation({
    mutationFn: () => {
      if (!editingFarm) throw new Error("Nenhuma fazenda selecionada.");
      return supportTenantsApi.updateTenantFarm(tenantId, editingFarm.id, {
        name: editingFarmName.trim(),
        description: editingFarmDescription.trim() || null,
        active: editingFarmActive,
      });
    },
    onSuccess: async () => {
      await invalidateTenant();
      setEditingFarm(null);
      setDeactivateFarmTarget(null);
      toast.success("Fazenda atualizada com sucesso");
    },
    onError: (error) => onMutationError(error, "Falha ao atualizar fazenda"),
  });

  const toggleFarmStatusMutation = useMutation({
    mutationFn: (payload: { farmId: string; active: boolean }) =>
      supportTenantsApi.updateTenantFarm(tenantId, payload.farmId, { active: payload.active }),
    onSuccess: async () => {
      await invalidateTenant();
      setDeactivateFarmTarget(null);
      toast.success("Status da fazenda atualizado");
    },
    onError: (error) => onMutationError(error, "Falha ao atualizar status da fazenda"),
  });

  const createFieldMutation = useMutation({
    mutationFn: () =>
      supportTenantsApi.createTenantField(tenantId, {
        farmId: fieldFarmId,
        name: fieldName.trim(),
        areaHectares: Number(fieldArea),
        description: fieldDescription.trim() || undefined,
      }),
    onSuccess: async () => {
      await invalidateTenant();
      setIsCreateFieldOpen(false);
      setFieldFarmId("");
      setFieldName("");
      setFieldArea("0");
      setFieldDescription("");
      toast.success("Talhão criado com sucesso");
    },
    onError: (error) => onMutationError(error, "Falha ao criar talhão"),
  });

  const updateFieldMutation = useMutation({
    mutationFn: () => {
      if (!editingField) throw new Error("Nenhum talhão selecionado.");
      return supportTenantsApi.updateTenantField(tenantId, editingField.id, {
        name: editingFieldName.trim(),
        areaHectares: Number(editingFieldArea),
        description: editingFieldDescription.trim() || null,
        active: editingFieldActive,
      });
    },
    onSuccess: async () => {
      await invalidateTenant();
      setEditingField(null);
      setDeactivateFieldTarget(null);
      toast.success("Talhão atualizado com sucesso");
    },
    onError: (error) => onMutationError(error, "Falha ao atualizar talhão"),
  });

  const toggleFieldStatusMutation = useMutation({
    mutationFn: (payload: { fieldId: string; active: boolean }) =>
      supportTenantsApi.updateTenantField(tenantId, payload.fieldId, { active: payload.active }),
    onSuccess: async () => {
      await invalidateTenant();
      setDeactivateFieldTarget(null);
      toast.success("Status do talhão atualizado");
    },
    onError: (error) => onMutationError(error, "Falha ao atualizar status do talhão"),
  });

  function openCreatePermissionDialog() {
    setPermissionUserId("");
    setPermissionFarmId("");
    setPermissionRole("VIEWER");
    setIsCreatePermissionOpen(true);
  }

  function openCreateFarmDialog() {
    setFarmName("");
    setFarmDescription("");
    setIsCreateFarmOpen(true);
  }

  function openCreateFieldDialog() {
    setFieldFarmId("");
    setFieldName("");
    setFieldArea("0");
    setFieldDescription("");
    setIsCreateFieldOpen(true);
  }

  function startEditPermission(permission: TenantPermissionDto) {
    setEditingPermission(permission);
    setEditingPermissionRole(permission.role);
    setEditingPermissionActive(permission.active);
  }

  function startEditFarm(farm: TenantFarmDto) {
    setEditingFarm(farm);
    setEditingFarmName(farm.name);
    setEditingFarmDescription(farm.description ?? "");
    setEditingFarmActive(farm.active);
  }

  function startEditField(field: EditableField) {
    setEditingField(field);
    setEditingFieldName(field.name);
    setEditingFieldArea(String(field.areaHectares));
    setEditingFieldDescription(field.description ?? "");
    setEditingFieldActive(field.active);
  }

  function startDeactivatePermission(permission: TenantPermissionDto) {
    setDeactivatePermissionTarget(permission);
  }

  function startDeactivateFarm(farm: TenantFarmDto) {
    setDeactivateFarmTarget(farm);
  }

  function startDeactivateField(field: EditableField) {
    setDeactivateFieldTarget(field);
  }

  if (detailQuery.isError) {
    return (
      <EmptyState
        title="Erro ao carregar tenant"
        description="Não foi possível carregar os dados deste tenant."
        actionLabel="Tentar novamente"
        onAction={() => detailQuery.refetch()}
      />
    );
  }

  if (detailQuery.isLoading || !tenant) {
    return <div className="p-6 text-sm">Carregando tenant...</div>;
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title={tenant.name}
        subtitle={`Key: ${tenant.key}`}
        breadcrumb="Operações / Tenants / Detalhe"
        actions={
          <div className="flex items-center gap-2">
            <RefreshIconButton
              onClick={() => detailQuery.refetch()}
              disabled={detailQuery.isFetching}
            />
            <Link to={routes.tenants}>
              <AppButton type="button" variant="secondary">
                Voltar para listagem
              </AppButton>
            </Link>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Ativo"
          value={formatBooleanPtBr(tenant.active)}
          hint="Status"
          icon={<Users size={16} />}
        />
        <MetricCard
          title="Usuários"
          value={String(tenant.stats.users)}
          hint="Total cadastrado"
          icon={<Users size={16} />}
        />
        <MetricCard
          title="Fazendas"
          value={String(tenant.stats.farms)}
          hint="Estrutura criada"
          icon={<Building2 size={16} />}
        />
        <MetricCard
          title="Criado em"
          value={formatDatePtBr(tenant.createdAt)}
          hint="Data de criação"
          icon={<Leaf size={16} />}
        />
      </div>

      <AppCard className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-[hsl(var(--brand-dark))]">
              Configurações do tenant
            </h2>
            <p className="text-sm text-[hsl(var(--foreground-muted))]">
              Atualize dados básicos e o status operacional do cliente.
            </p>
          </div>
          <div className="flex gap-2">
            <AppButton type="button" variant="secondary" onClick={() => setIsEditingTenant(true)}>
              <Pencil size={16} className="mr-1" />
              Editar tenant
            </AppButton>
            <AppButton
              type="button"
              variant="ghost"
              className={tenant.active ? "border border-red-200 text-red-600 hover:bg-red-50" : ""}
              disabled={toggleTenantMutation.isPending}
              onClick={() => {
                if (tenant.active) {
                  setIsDeactivateTenantOpen(true);
                  return;
                }
                toggleTenantMutation.mutate(true);
              }}
            >
              {tenant.active ? (
                <Trash2 size={16} className="mr-1" />
              ) : (
                <RotateCcw size={16} className="mr-1" />
              )}
              {toggleTenantMutation.isPending
                ? "Atualizando..."
                : tenant.active
                  ? "Inativar tenant"
                  : "Reativar tenant"}
            </AppButton>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-[var(--radius-md)] border bg-[hsl(var(--surface-muted))] px-3 py-2">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[hsl(var(--foreground-muted))]">
              Key
            </p>
            <p className="mt-1 text-sm font-semibold text-[hsl(var(--brand-dark))]">{tenant.key}</p>
          </div>
          <div className="rounded-[var(--radius-md)] border bg-[hsl(var(--surface-muted))] px-3 py-2">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[hsl(var(--foreground-muted))]">
              Nome
            </p>
            <p className="mt-1 text-sm font-semibold text-[hsl(var(--brand-dark))]">
              {tenant.name}
            </p>
          </div>
        </div>
      </AppCard>

      <AppCard className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <AppButton
            type="button"
            variant={tab === "users" ? "primary" : "ghost"}
            onClick={() => setTab("users")}
          >
            Usuários
          </AppButton>
          <AppButton
            type="button"
            variant={tab === "permissions" ? "primary" : "ghost"}
            onClick={() => setTab("permissions")}
          >
            Permissões
          </AppButton>
          <AppButton
            type="button"
            variant={tab === "farms" ? "primary" : "ghost"}
            onClick={() => setTab("farms")}
          >
            Fazendas
          </AppButton>
          <AppButton
            type="button"
            variant={tab === "fields" ? "primary" : "ghost"}
            onClick={() => setTab("fields")}
          >
            Talhões
          </AppButton>
        </div>

        {tab === "users" ? (
          <UsersManager
            users={tenant.users}
            isLoading={detailQuery.isLoading}
            onChanged={invalidateTenant}
            api={tenantUsersApi}
          />
        ) : null}

        {tab === "permissions" ? (
          <div className="space-y-4">
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-[hsl(var(--brand-dark))]">
                  Permissões por fazenda
                </h3>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-[hsl(var(--foreground-muted))]">
                    {tenant.permissions.length} regras
                  </span>
                  <AppButton
                    type="button"
                    className="h-9 px-3"
                    onClick={openCreatePermissionDialog}
                  >
                    <Plus size={16} className="mr-1" />
                    Nova permissão
                  </AppButton>
                </div>
              </div>

              {tenant.permissions.length === 0 ? (
                <EmptyState
                  title="Nenhuma permissão"
                  description="Crie permissões por fazenda para os usuários deste tenant."
                />
              ) : (
                <div className="overflow-auto rounded-[var(--radius-md)] border">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-[hsl(var(--surface-muted))]">
                      <tr>
                        <th className="px-3 py-2">Usuário</th>
                        <th className="px-3 py-2">E-mail</th>
                        <th className="px-3 py-2">Fazenda</th>
                        <th className="px-3 py-2">Papel</th>
                        <th className="px-3 py-2">Ativa</th>
                        <th className="px-3 py-2 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tenant.permissions.map((permission) => (
                        <tr key={permission.id} className="border-t">
                          <td className="px-3 py-2">{permission.userName}</td>
                          <td className="px-3 py-2">{permission.userEmail}</td>
                          <td className="px-3 py-2">{permission.farm.name}</td>
                          <td className="px-3 py-2">{permission.role}</td>
                          <td className="px-3 py-2">{formatBooleanPtBr(permission.active)}</td>
                          <td className="px-3 py-2">
                            <div className="flex justify-end gap-2">
                              <TableIconButton
                                aria-label={`Editar permissão de ${permission.userName}`}
                                onClick={() => startEditPermission(permission)}
                              >
                                <Pencil size={16} />
                              </TableIconButton>
                              {permission.active ? (
                                <TableIconButton
                                  aria-label={`Inativar permissão de ${permission.userName}`}
                                  variant="danger"
                                  disabled={togglePermissionStatusMutation.isPending}
                                  onClick={() => startDeactivatePermission(permission)}
                                >
                                  <Trash2 size={16} />
                                </TableIconButton>
                              ) : (
                                <TableIconButton
                                  aria-label={`Reativar permissão de ${permission.userName}`}
                                  className="border-emerald-200 text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                                  disabled={togglePermissionStatusMutation.isPending}
                                  onClick={() =>
                                    togglePermissionStatusMutation.mutate({
                                      permissionId: permission.id,
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
                </div>
              )}
            </section>
          </div>
        ) : null}

        {tab === "farms" ? (
          <div className="space-y-4">
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-[hsl(var(--brand-dark))]">
                  Fazendas do tenant
                </h3>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-[hsl(var(--foreground-muted))]">
                    {tenant.farms.length} fazendas
                  </span>
                  <AppButton type="button" className="h-9 px-3" onClick={openCreateFarmDialog}>
                    <Plus size={16} className="mr-1" />
                    Nova fazenda
                  </AppButton>
                </div>
              </div>

              {tenant.farms.length === 0 ? (
                <EmptyState
                  title="Nenhuma fazenda"
                  description="Cadastre fazendas para este tenant."
                />
              ) : (
                <div className="overflow-auto rounded-[var(--radius-md)] border">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-[hsl(var(--surface-muted))]">
                      <tr>
                        <th className="px-3 py-2">Nome</th>
                        <th className="px-3 py-2">Descrição</th>
                        <th className="px-3 py-2">Ativa</th>
                        <th className="px-3 py-2">Talhões</th>
                        <th className="px-3 py-2 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tenant.farms.map((farm) => (
                        <tr key={farm.id} className="border-t">
                          <td className="px-3 py-2">{farm.name}</td>
                          <td className="px-3 py-2">{farm.description ?? "-"}</td>
                          <td className="px-3 py-2">{formatBooleanPtBr(farm.active)}</td>
                          <td className="px-3 py-2">{farm.fields.length}</td>
                          <td className="px-3 py-2">
                            <div className="flex justify-end gap-2">
                              <TableIconButton
                                aria-label={`Editar ${farm.name}`}
                                onClick={() => startEditFarm(farm)}
                              >
                                <Pencil size={16} />
                              </TableIconButton>
                              {farm.active ? (
                                <TableIconButton
                                  aria-label={`Inativar ${farm.name}`}
                                  variant="danger"
                                  disabled={toggleFarmStatusMutation.isPending}
                                  onClick={() => startDeactivateFarm(farm)}
                                >
                                  <Trash2 size={16} />
                                </TableIconButton>
                              ) : (
                                <TableIconButton
                                  aria-label={`Reativar ${farm.name}`}
                                  className="border-emerald-200 text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                                  disabled={toggleFarmStatusMutation.isPending}
                                  onClick={() =>
                                    toggleFarmStatusMutation.mutate({
                                      farmId: farm.id,
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
                </div>
              )}
            </section>
          </div>
        ) : null}

        {tab === "fields" ? (
          <div className="space-y-4">
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-[hsl(var(--brand-dark))]">
                  Talhões do tenant
                </h3>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-[hsl(var(--foreground-muted))]">
                    {fieldRows.length} talhões
                  </span>
                  <AppButton type="button" className="h-9 px-3" onClick={openCreateFieldDialog}>
                    <Plus size={16} className="mr-1" />
                    Novo talhão
                  </AppButton>
                </div>
              </div>

              {fieldRows.length === 0 ? (
                <EmptyState
                  title="Nenhum talhão"
                  description="Cadastre talhões para as fazendas deste tenant."
                />
              ) : (
                <div className="overflow-auto rounded-[var(--radius-md)] border">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-[hsl(var(--surface-muted))]">
                      <tr>
                        <th className="px-3 py-2">Nome</th>
                        <th className="px-3 py-2">Fazenda</th>
                        <th className="px-3 py-2">Área (ha)</th>
                        <th className="px-3 py-2">Ativo</th>
                        <th className="px-3 py-2 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fieldRows.map((field) => (
                        <tr key={field.id} className="border-t">
                          <td className="px-3 py-2">{field.name}</td>
                          <td className="px-3 py-2">{field.farmName}</td>
                          <td className="px-3 py-2">{field.areaHectares}</td>
                          <td className="px-3 py-2">{formatBooleanPtBr(field.active)}</td>
                          <td className="px-3 py-2">
                            <div className="flex justify-end gap-2">
                              <TableIconButton
                                aria-label={`Editar ${field.name}`}
                                onClick={() => startEditField(field)}
                              >
                                <Pencil size={16} />
                              </TableIconButton>
                              {field.active ? (
                                <TableIconButton
                                  aria-label={`Inativar ${field.name}`}
                                  variant="danger"
                                  disabled={toggleFieldStatusMutation.isPending}
                                  onClick={() => startDeactivateField(field)}
                                >
                                  <Trash2 size={16} />
                                </TableIconButton>
                              ) : (
                                <TableIconButton
                                  aria-label={`Reativar ${field.name}`}
                                  className="border-emerald-200 text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                                  disabled={toggleFieldStatusMutation.isPending}
                                  onClick={() =>
                                    toggleFieldStatusMutation.mutate({
                                      fieldId: field.id,
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
                </div>
              )}
            </section>
          </div>
        ) : null}
      </AppCard>

      <AppDialog
        open={isEditingTenant}
        onOpenChange={(open) => {
          if (!open) setIsEditingTenant(false);
        }}
        title="Editar tenant"
        description="Atualize a key e o nome do tenant."
        footer={
          <>
            <AppButton type="button" variant="ghost" onClick={() => setIsEditingTenant(false)}>
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

      <AppDialog
        open={isCreatePermissionOpen}
        onOpenChange={(open) => {
          if (!open) setIsCreatePermissionOpen(false);
        }}
        title="Nova permissão"
        description="Vincule um usuário a uma fazenda com um papel específico."
        footer={
          <>
            <AppButton
              type="button"
              variant="ghost"
              onClick={() => setIsCreatePermissionOpen(false)}
            >
              Cancelar
            </AppButton>
            <AppButton
              type="button"
              disabled={createPermissionMutation.isPending}
              onClick={() => {
                if (!permissionUserId || !permissionFarmId) {
                  toast.error("Selecione usuário e fazenda");
                  return;
                }
                createPermissionMutation.mutate();
              }}
            >
              <Plus size={16} className="mr-1" />
              {createPermissionMutation.isPending ? "Criando..." : "Criar permissão"}
            </AppButton>
          </>
        }
      >
        <div className="grid gap-3">
          <select
            value={permissionUserId}
            onChange={(event) => setPermissionUserId(event.target.value)}
            className={selectClassName}
          >
            <option value="">Selecione o usuário</option>
            {activeUsers.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>
          <select
            value={permissionFarmId}
            onChange={(event) => setPermissionFarmId(event.target.value)}
            className={selectClassName}
          >
            <option value="">Selecione a fazenda</option>
            {activeFarms.map((farm) => (
              <option key={farm.id} value={farm.id}>
                {farm.name}
              </option>
            ))}
          </select>
          <select
            value={permissionRole}
            onChange={(event) => setPermissionRole(event.target.value as FarmUserRole)}
            className={selectClassName}
          >
            {ROLES.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>
      </AppDialog>

      <AppDialog
        open={editingPermission !== null}
        onOpenChange={(open) => {
          if (!open) setEditingPermission(null);
        }}
        title="Editar permissão"
        description={
          editingPermission
            ? `${editingPermission.userName} · ${editingPermission.farm.name}`
            : undefined
        }
        footer={
          <>
            <AppButton type="button" variant="ghost" onClick={() => setEditingPermission(null)}>
              Cancelar
            </AppButton>
            <AppButton
              type="button"
              disabled={updatePermissionMutation.isPending}
              onClick={() => updatePermissionMutation.mutate()}
            >
              <Check size={16} className="mr-1" />
              {updatePermissionMutation.isPending ? "Salvando..." : "Salvar permissão"}
            </AppButton>
          </>
        }
      >
        <div className="grid gap-3">
          <select
            value={editingPermissionRole}
            onChange={(event) => setEditingPermissionRole(event.target.value as FarmUserRole)}
            className={selectClassName}
          >
            {ROLES.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={editingPermissionActive}
              onChange={(event) => setEditingPermissionActive(event.target.checked)}
            />
            Permissão ativa
          </label>
        </div>
      </AppDialog>

      <AppDialog
        open={isCreateFarmOpen}
        onOpenChange={(open) => {
          if (!open) setIsCreateFarmOpen(false);
        }}
        title="Nova fazenda"
        description="Cadastre a fazenda do tenant."
        footer={
          <>
            <AppButton type="button" variant="ghost" onClick={() => setIsCreateFarmOpen(false)}>
              Cancelar
            </AppButton>
            <AppButton
              type="button"
              disabled={createFarmMutation.isPending}
              onClick={() => {
                if (!farmName.trim()) {
                  toast.error("Informe o nome da fazenda");
                  return;
                }
                createFarmMutation.mutate();
              }}
            >
              <Plus size={16} className="mr-1" />
              {createFarmMutation.isPending ? "Criando..." : "Criar fazenda"}
            </AppButton>
          </>
        }
      >
        <div className="grid gap-3">
          <input
            value={farmName}
            onChange={(event) => setFarmName(event.target.value)}
            placeholder="Nome da fazenda"
            className={inputClassName}
          />
          <textarea
            value={farmDescription}
            onChange={(event) => setFarmDescription(event.target.value)}
            placeholder="Descrição"
            className={textareaClassName}
          />
        </div>
      </AppDialog>

      <AppDialog
        open={editingFarm !== null}
        onOpenChange={(open) => {
          if (!open) setEditingFarm(null);
        }}
        title="Editar fazenda"
        description={editingFarm ? editingFarm.name : undefined}
        footer={
          <>
            <AppButton type="button" variant="ghost" onClick={() => setEditingFarm(null)}>
              Cancelar
            </AppButton>
            <AppButton
              type="button"
              disabled={updateFarmMutation.isPending}
              onClick={() => {
                if (!editingFarmName.trim()) {
                  toast.error("Informe o nome da fazenda");
                  return;
                }
                updateFarmMutation.mutate();
              }}
            >
              <Check size={16} className="mr-1" />
              {updateFarmMutation.isPending ? "Salvando..." : "Salvar fazenda"}
            </AppButton>
          </>
        }
      >
        <div className="grid gap-3">
          <input
            value={editingFarmName}
            onChange={(event) => setEditingFarmName(event.target.value)}
            placeholder="Nome da fazenda"
            className={inputClassName}
          />
          <textarea
            value={editingFarmDescription}
            onChange={(event) => setEditingFarmDescription(event.target.value)}
            placeholder="Descrição"
            className={textareaClassName}
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={editingFarmActive}
              onChange={(event) => setEditingFarmActive(event.target.checked)}
            />
            Fazenda ativa
          </label>
        </div>
      </AppDialog>

      <AppDialog
        open={isCreateFieldOpen}
        onOpenChange={(open) => {
          if (!open) setIsCreateFieldOpen(false);
        }}
        title="Novo talhão"
        description="Cadastre um talhão para uma fazenda ativa."
        footer={
          <>
            <AppButton type="button" variant="ghost" onClick={() => setIsCreateFieldOpen(false)}>
              Cancelar
            </AppButton>
            <AppButton
              type="button"
              disabled={createFieldMutation.isPending}
              onClick={() => {
                if (!fieldFarmId || !fieldName.trim()) {
                  toast.error("Informe fazenda e nome do talhão");
                  return;
                }
                createFieldMutation.mutate();
              }}
            >
              <Plus size={16} className="mr-1" />
              {createFieldMutation.isPending ? "Criando..." : "Criar talhão"}
            </AppButton>
          </>
        }
      >
        <div className="grid gap-3">
          <select
            value={fieldFarmId}
            onChange={(event) => setFieldFarmId(event.target.value)}
            className={selectClassName}
          >
            <option value="">Selecione a fazenda</option>
            {activeFarms.map((farm) => (
              <option key={farm.id} value={farm.id}>
                {farm.name}
              </option>
            ))}
          </select>
          <input
            value={fieldName}
            onChange={(event) => setFieldName(event.target.value)}
            placeholder="Nome do talhão"
            className={inputClassName}
          />
          <input
            value={fieldArea}
            onChange={(event) => setFieldArea(event.target.value)}
            placeholder="Área (ha)"
            type="number"
            min={0}
            step="0.01"
            className={inputClassName}
          />
          <textarea
            value={fieldDescription}
            onChange={(event) => setFieldDescription(event.target.value)}
            placeholder="Descrição"
            className={textareaClassName}
          />
        </div>
      </AppDialog>

      <AppDialog
        open={editingField !== null}
        onOpenChange={(open) => {
          if (!open) setEditingField(null);
        }}
        title="Editar talhão"
        description={editingField ? `Fazenda: ${editingField.farmName}` : undefined}
        footer={
          <>
            <AppButton type="button" variant="ghost" onClick={() => setEditingField(null)}>
              Cancelar
            </AppButton>
            <AppButton
              type="button"
              disabled={updateFieldMutation.isPending}
              onClick={() => {
                if (!editingFieldName.trim()) {
                  toast.error("Informe o nome do talhão");
                  return;
                }
                updateFieldMutation.mutate();
              }}
            >
              <Check size={16} className="mr-1" />
              {updateFieldMutation.isPending ? "Salvando..." : "Salvar talhão"}
            </AppButton>
          </>
        }
      >
        <div className="grid gap-3">
          <input
            value={editingFieldName}
            onChange={(event) => setEditingFieldName(event.target.value)}
            placeholder="Nome do talhão"
            className={inputClassName}
          />
          <input
            value={editingFieldArea}
            onChange={(event) => setEditingFieldArea(event.target.value)}
            placeholder="Área (ha)"
            type="number"
            min={0}
            step="0.01"
            className={inputClassName}
          />
          <textarea
            value={editingFieldDescription}
            onChange={(event) => setEditingFieldDescription(event.target.value)}
            placeholder="Descrição"
            className={textareaClassName}
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={editingFieldActive}
              onChange={(event) => setEditingFieldActive(event.target.checked)}
            />
            Talhão ativo
          </label>
        </div>
      </AppDialog>

      <ConfirmDialog
        open={isDeactivateTenantOpen}
        onOpenChange={(open) => {
          if (!open) setIsDeactivateTenantOpen(false);
        }}
        title="Inativar tenant"
        description="O tenant ficará indisponível para uso, mas o histórico será mantido."
        confirmLabel="Inativar"
        isPending={toggleTenantMutation.isPending}
        onConfirm={() => {
          setIsDeactivateTenantOpen(false);
          toggleTenantMutation.mutate(false);
        }}
      />

      <ConfirmDialog
        open={deactivatePermissionTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeactivatePermissionTarget(null);
        }}
        title="Inativar permissão"
        description={
          deactivatePermissionTarget
            ? `${deactivatePermissionTarget.userName} na fazenda ${deactivatePermissionTarget.farm.name} será inativada.`
            : ""
        }
        confirmLabel="Inativar"
        isPending={togglePermissionStatusMutation.isPending}
        onConfirm={() => {
          if (!deactivatePermissionTarget) return;
          setDeactivatePermissionTarget(null);
          togglePermissionStatusMutation.mutate({
            permissionId: deactivatePermissionTarget.id,
            active: false,
          });
        }}
      />

      <ConfirmDialog
        open={deactivateFarmTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeactivateFarmTarget(null);
        }}
        title="Inativar fazenda"
        description={deactivateFarmTarget ? `${deactivateFarmTarget.name} será inativada.` : ""}
        confirmLabel="Inativar"
        isPending={toggleFarmStatusMutation.isPending}
        onConfirm={() => {
          if (!deactivateFarmTarget) return;
          setDeactivateFarmTarget(null);
          toggleFarmStatusMutation.mutate({ farmId: deactivateFarmTarget.id, active: false });
        }}
      />

      <ConfirmDialog
        open={deactivateFieldTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeactivateFieldTarget(null);
        }}
        title="Inativar talhão"
        description={deactivateFieldTarget ? `${deactivateFieldTarget.name} será inativado.` : ""}
        confirmLabel="Inativar"
        isPending={toggleFieldStatusMutation.isPending}
        onConfirm={() => {
          if (!deactivateFieldTarget) return;
          setDeactivateFieldTarget(null);
          toggleFieldStatusMutation.mutate({ fieldId: deactivateFieldTarget.id, active: false });
        }}
      />
    </div>
  );
}
