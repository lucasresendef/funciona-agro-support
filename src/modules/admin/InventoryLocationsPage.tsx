import { adminOperationsApi } from "@/modules/admin/admin-operations.api";
import type { InventoryLocationEntity } from "@/modules/admin/contracts/admin-operations.dto";
import type { FarmEntity } from "@/shared/types/auth";
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

const inputClassName = "h-10 rounded-[var(--radius-md)] border bg-white px-3 text-sm";
const textareaClassName = "min-h-24 rounded-[var(--radius-md)] border bg-white px-3 py-2 text-sm";

export function InventoryLocationsPage() {
  const queryClient = useQueryClient();
  const pagination = usePaginationState();
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | null>(null);
  const [targetLocation, setTargetLocation] = useState<InventoryLocationEntity | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<InventoryLocationEntity | null>(null);
  const [farmId, setFarmId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const locationsQuery = useQuery({
    queryKey: [...queryKeys.inventoryLocations, pagination.pagination],
    queryFn: () => adminOperationsApi.listInventoryLocations(pagination.pagination),
    placeholderData: keepPreviousData,
  });

  const farmsQuery = useQuery({
    queryKey: [...queryKeys.farms, { page: 1, limit: 100, active: true }],
    queryFn: () => adminOperationsApi.listFarms({ page: 1, limit: 100, active: true }),
    enabled: dialogMode !== null,
  });

  async function invalidateLocations() {
    await queryClient.invalidateQueries({ queryKey: queryKeys.inventoryLocations });
  }

  function onError(error: unknown, fallback: string) {
    toast.error(getApiErrorMessage(error, fallback));
  }

  function openCreateDialog() {
    setTargetLocation(null);
    setFarmId("");
    setName("");
    setDescription("");
    setDialogMode("create");
  }

  function openEditDialog(location: InventoryLocationEntity) {
    setTargetLocation(location);
    setFarmId(location.farmId);
    setName(location.name);
    setDescription(location.description ?? "");
    setDialogMode("edit");
  }

  function closeDialog() {
    setDialogMode(null);
    setTargetLocation(null);
  }

  const createMutation = useMutation({
    mutationFn: () =>
      adminOperationsApi.createInventoryLocation({
        farmId,
        name: name.trim(),
        description: description.trim() || undefined,
      }),
    onSuccess: async () => {
      await invalidateLocations();
      closeDialog();
      toast.success("Local de estoque criado com sucesso");
    },
    onError: (error) => onError(error, "Falha ao criar local de estoque"),
  });

  const updateMutation = useMutation({
    mutationFn: () => {
      if (!targetLocation) throw new Error("Nenhum local selecionado.");
      return adminOperationsApi.updateInventoryLocation(targetLocation.id, {
        name: name.trim(),
        description: description.trim() || null,
      });
    },
    onSuccess: async () => {
      await invalidateLocations();
      closeDialog();
      toast.success("Local de estoque atualizado com sucesso");
    },
    onError: (error) => onError(error, "Falha ao atualizar local de estoque"),
  });

  const deactivateMutation = useMutation({
    mutationFn: (locationId: string) => adminOperationsApi.deactivateInventoryLocation(locationId),
    onSuccess: async () => {
      await invalidateLocations();
      setConfirmTarget(null);
      toast.success("Local de estoque inativado com sucesso");
    },
    onError: (error) => onError(error, "Falha ao inativar local de estoque"),
  });

  const locations = locationsQuery.data?.data ?? [];
  const farms = farmsQuery.data?.data ?? [];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Locais de Estoque"
        subtitle="Gestão dos galpões e pontos de armazenagem"
        breadcrumb="Operações / Locais de Estoque"
        actions={
          <div className="flex items-center gap-2">
            <RefreshIconButton
              onClick={() => {
                void queryClient.invalidateQueries({ queryKey: queryKeys.inventoryLocations });
                void queryClient.invalidateQueries({ queryKey: queryKeys.farms });
              }}
              disabled={locationsQuery.isFetching || farmsQuery.isFetching}
            />
            <AppButton type="button" onClick={openCreateDialog}>
              Novo local
            </AppButton>
          </div>
        }
      />

      {locationsQuery.isError ? (
        <EmptyState
          title="Erro ao carregar locais"
          description="Não foi possível carregar a listagem."
        />
      ) : locations.length === 0 ? (
        <EmptyState
          title="Nenhum local cadastrado"
          description="Crie locais de estoque para registrar saldos e movimentações."
          actionLabel="Novo local"
          onAction={openCreateDialog}
        />
      ) : (
        <>
          <AppCard className="overflow-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[hsl(var(--surface-muted))]">
              <tr>
                <th className="px-3 py-2">Nome</th>
                <th className="px-3 py-2">Fazenda</th>
                <th className="px-3 py-2">Descrição</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {locations.map((location) => (
                <tr key={location.id} className="border-t">
                  <td className="px-3 py-2">{location.name}</td>
                  <td className="px-3 py-2">{location.farm.name}</td>
                  <td className="px-3 py-2">{location.description ?? "-"}</td>
                  <td className="px-3 py-2">{location.active ? "Ativo" : "Inativo"}</td>
                  <td className="px-3 py-2">
                    <div className="flex justify-end gap-2">
                      <TableIconButton
                        aria-label={`Editar ${location.name}`}
                        onClick={() => openEditDialog(location)}
                      >
                        <Pencil size={16} />
                      </TableIconButton>
                      <TableIconButton
                        aria-label={`Inativar ${location.name}`}
                        variant="danger"
                        disabled={deactivateMutation.isPending}
                        onClick={() => setConfirmTarget(location)}
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
            total={locationsQuery.data?.total ?? 0}
            totalPages={locationsQuery.data?.totalPages ?? 0}
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
        title={dialogMode === "edit" ? "Editar local de estoque" : "Novo local de estoque"}
        description="Use o mesmo formulário para criar e atualizar um local de armazenagem."
        footer={
          <>
            <AppButton type="button" variant="ghost" onClick={closeDialog}>
              Cancelar
            </AppButton>
            <AppButton
              type="button"
              disabled={createMutation.isPending || updateMutation.isPending}
              onClick={() => {
                if (!farmId || !name.trim()) {
                  toast.error("Informe fazenda e nome do local");
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
                  ? "Salvar local"
                  : "Criar local"}
            </AppButton>
          </>
        }
      >
        <div className="grid gap-3">
          <select
            value={farmId}
            onChange={(event) => setFarmId(event.target.value)}
            className={inputClassName}
            disabled={dialogMode === "edit"}
          >
            <option value="">Selecione a fazenda</option>
            {farms.map((farm: FarmEntity) => (
              <option key={farm.id} value={farm.id}>
                {farm.name}
              </option>
            ))}
          </select>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Nome do local"
            className={inputClassName}
          />
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Descrição"
            className={textareaClassName}
          />
        </div>
      </AppDialog>

      <ConfirmDialog
        open={Boolean(confirmTarget)}
        onOpenChange={(open) => {
          if (!open) setConfirmTarget(null);
        }}
        title="Inativar local de estoque"
        description={`O local "${confirmTarget?.name ?? ""}" será removido da operação ativa.`}
        confirmLabel="Inativar local"
        isPending={deactivateMutation.isPending}
        onConfirm={() => {
          if (!confirmTarget) return;
          deactivateMutation.mutate(confirmTarget.id);
        }}
      />
    </div>
  );
}
