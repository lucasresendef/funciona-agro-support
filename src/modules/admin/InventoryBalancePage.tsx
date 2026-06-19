import { adminOperationsApi } from "@/modules/admin/admin-operations.api";
import type {
  InventoryBalanceEntity,
  InventoryLocationEntity,
  ProductEntity,
} from "@/modules/admin/contracts/admin-operations.dto";
import type { FarmEntity } from "@/shared/types/auth";
import { queryKeys } from "@/shared/config/query-keys";
import { getApiErrorMessage } from "@/shared/lib/http/security";
import { AppButton } from "@/shared/ui/components/AppButton";
import { AppCard } from "@/shared/ui/components/AppCard";
import { AppDialog } from "@/shared/ui/components/AppDialog";
import { ConfirmDialog } from "@/shared/ui/components/ConfirmDialog";
import { EmptyState } from "@/shared/ui/components/EmptyState";
import { PageHeader } from "@/shared/ui/components/PageHeader";
import { RefreshIconButton } from "@/shared/ui/components/RefreshIconButton";
import { TableIconButton } from "@/shared/ui/components/TableIconButton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

const inputClassName = "h-10 rounded-[var(--radius-md)] border bg-white px-3 text-sm";
const textareaClassName = "min-h-24 rounded-[var(--radius-md)] border bg-white px-3 py-2 text-sm";

export function InventoryBalancePage() {
  const queryClient = useQueryClient();
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | null>(null);
  const [targetBalance, setTargetBalance] = useState<InventoryBalanceEntity | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<InventoryBalanceEntity | null>(null);
  const [farmId, setFarmId] = useState("");
  const [inventoryLocationId, setInventoryLocationId] = useState("");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("0");
  const [averageUnitCost, setAverageUnitCost] = useState("0");
  const [notes, setNotes] = useState("");

  const balancesQuery = useQuery({
    queryKey: [...queryKeys.inventoryBalance, { page: 1, limit: 100 }],
    queryFn: () => adminOperationsApi.listInventoryBalances({ page: 1, limit: 100 }),
  });

  const farmsQuery = useQuery({
    queryKey: [...queryKeys.farms, { page: 1, limit: 100, active: true }],
    queryFn: () => adminOperationsApi.listFarms({ page: 1, limit: 100, active: true }),
    enabled: dialogMode === "create",
  });

  const locationsQuery = useQuery({
    queryKey: [...queryKeys.inventoryLocations, { page: 1, limit: 100, active: true }],
    queryFn: () => adminOperationsApi.listInventoryLocations({ page: 1, limit: 100, active: true }),
    enabled: dialogMode === "create",
  });

  const productsQuery = useQuery({
    queryKey: [...queryKeys.products, { page: 1, limit: 100, active: true }],
    queryFn: () => adminOperationsApi.listProducts({ page: 1, limit: 100, active: true }),
    enabled: dialogMode === "create",
  });

  const filteredLocations = useMemo(
    () =>
      (locationsQuery.data?.data ?? []).filter(
        (location: InventoryLocationEntity) => !farmId || location.farmId === farmId,
      ),
    [farmId, locationsQuery.data?.data],
  );

  async function invalidateBalances() {
    await queryClient.invalidateQueries({ queryKey: queryKeys.inventoryBalance });
    await queryClient.invalidateQueries({ queryKey: queryKeys.products });
  }

  function onError(error: unknown, fallback: string) {
    toast.error(getApiErrorMessage(error, fallback));
  }

  function openCreateDialog() {
    setTargetBalance(null);
    setFarmId("");
    setInventoryLocationId("");
    setProductId("");
    setQuantity("0");
    setAverageUnitCost("0");
    setNotes("");
    setDialogMode("create");
  }

  function openEditDialog(balance: InventoryBalanceEntity) {
    setTargetBalance(balance);
    setFarmId(balance.farmId);
    setInventoryLocationId(balance.inventoryLocationId);
    setProductId(balance.productId);
    setQuantity(String(balance.quantity));
    setAverageUnitCost(String(balance.averageUnitCost));
    setNotes("");
    setDialogMode("edit");
  }

  function closeDialog() {
    setDialogMode(null);
    setTargetBalance(null);
  }

  const createMutation = useMutation({
    mutationFn: () =>
      adminOperationsApi.createInventoryBalance({
        farmId,
        inventoryLocationId,
        productId,
        quantity: Number(quantity),
        averageUnitCost: Number(averageUnitCost),
        notes: notes.trim() || undefined,
      }),
    onSuccess: async () => {
      await invalidateBalances();
      closeDialog();
      toast.success("Saldo registrado com sucesso");
    },
    onError: (error) => onError(error, "Falha ao registrar saldo"),
  });

  const updateMutation = useMutation({
    mutationFn: () => {
      if (!targetBalance) throw new Error("Nenhum saldo selecionado.");
      return adminOperationsApi.updateInventoryBalance(targetBalance.id, {
        quantity: Number(quantity),
        averageUnitCost: Number(averageUnitCost),
        notes: notes.trim() || null,
      });
    },
    onSuccess: async () => {
      await invalidateBalances();
      closeDialog();
      toast.success("Saldo atualizado com sucesso");
    },
    onError: (error) => onError(error, "Falha ao atualizar saldo"),
  });

  const deactivateMutation = useMutation({
    mutationFn: (balanceId: string) => adminOperationsApi.deactivateInventoryBalance(balanceId),
    onSuccess: async () => {
      await invalidateBalances();
      setConfirmTarget(null);
      toast.success("Saldo inativado com sucesso");
    },
    onError: (error) => onError(error, "Falha ao inativar saldo"),
  });

  const balances = balancesQuery.data?.data ?? [];
  const farms = farmsQuery.data?.data ?? [];
  const products = productsQuery.data?.data ?? [];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Saldo de Estoque"
        subtitle="Gestão de saldo por produto e local de estoque"
        breadcrumb="Operações / Saldo de Estoque"
        actions={
          <div className="flex items-center gap-2">
            <RefreshIconButton
              onClick={() => {
                void queryClient.invalidateQueries({ queryKey: queryKeys.inventoryBalance });
                void queryClient.invalidateQueries({ queryKey: queryKeys.products });
                void queryClient.invalidateQueries({ queryKey: queryKeys.inventoryLocations });
                void queryClient.invalidateQueries({ queryKey: queryKeys.farms });
              }}
              disabled={
                balancesQuery.isFetching ||
                productsQuery.isFetching ||
                locationsQuery.isFetching ||
                farmsQuery.isFetching
              }
            />
            <AppButton type="button" onClick={openCreateDialog}>
              Novo saldo
            </AppButton>
          </div>
        }
      />

      {balancesQuery.isError ? (
        <EmptyState
          title="Erro ao carregar saldos"
          description="Não foi possível carregar a listagem."
        />
      ) : balances.length === 0 ? (
        <EmptyState
          title="Nenhum saldo cadastrado"
          description="Registre saldos para controlar o estoque operacional."
          actionLabel="Novo saldo"
          onAction={openCreateDialog}
        />
      ) : (
        <AppCard className="overflow-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[hsl(var(--surface-muted))]">
              <tr>
                <th className="px-3 py-2">Produto</th>
                <th className="px-3 py-2">Fazenda</th>
                <th className="px-3 py-2">Local</th>
                <th className="px-3 py-2">Quantidade</th>
                <th className="px-3 py-2">Custo médio</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {balances.map((balance) => (
                <tr key={balance.id} className="border-t">
                  <td className="px-3 py-2">{balance.product.name}</td>
                  <td className="px-3 py-2">{balance.farm.name}</td>
                  <td className="px-3 py-2">{balance.inventoryLocation.name}</td>
                  <td className="px-3 py-2">{Number(balance.quantity)}</td>
                  <td className="px-3 py-2">{Number(balance.averageUnitCost)}</td>
                  <td className="px-3 py-2">{balance.active ? "Ativo" : "Inativo"}</td>
                  <td className="px-3 py-2">
                    <div className="flex justify-end gap-2">
                      <TableIconButton
                        aria-label={`Editar saldo de ${balance.product.name}`}
                        onClick={() => openEditDialog(balance)}
                      >
                        <Pencil size={16} />
                      </TableIconButton>
                      <TableIconButton
                        aria-label={`Inativar saldo de ${balance.product.name}`}
                        variant="danger"
                        disabled={deactivateMutation.isPending}
                        onClick={() => setConfirmTarget(balance)}
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
      )}

      <AppDialog
        open={dialogMode !== null}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
        title={dialogMode === "edit" ? "Editar saldo" : "Novo saldo"}
        description="Use o mesmo diálogo para registrar um saldo novo ou ajustar um saldo existente."
        footer={
          <>
            <AppButton type="button" variant="ghost" onClick={closeDialog}>
              Cancelar
            </AppButton>
            <AppButton
              type="button"
              disabled={createMutation.isPending || updateMutation.isPending}
              onClick={() => {
                if (dialogMode === "create" && (!farmId || !inventoryLocationId || !productId)) {
                  toast.error("Selecione fazenda, local e produto");
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
                  ? "Salvar saldo"
                  : "Registrar saldo"}
            </AppButton>
          </>
        }
      >
        <div className="grid gap-3">
          {dialogMode === "create" ? (
            <>
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
              <select
                value={inventoryLocationId}
                onChange={(event) => setInventoryLocationId(event.target.value)}
                className={inputClassName}
              >
                <option value="">Selecione o local de estoque</option>
                {filteredLocations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>
              <select
                value={productId}
                onChange={(event) => setProductId(event.target.value)}
                className={inputClassName}
              >
                <option value="">Selecione o produto</option>
                {products.map((product: ProductEntity) => (
                  <option key={product.id} value={product.id}>
                    {product.name} ({product.code})
                  </option>
                ))}
              </select>
            </>
          ) : (
            <div className="rounded-[var(--radius-md)] border bg-[hsl(var(--surface-muted))] px-4 py-3 text-sm text-[hsl(var(--foreground-muted))]">
              {targetBalance?.product.name} em {targetBalance?.inventoryLocation.name}
            </div>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              placeholder="Quantidade"
              type="number"
              min={0}
              step="0.01"
              className={inputClassName}
            />
            <input
              value={averageUnitCost}
              onChange={(event) => setAverageUnitCost(event.target.value)}
              placeholder="Custo médio unitário"
              type="number"
              min={0}
              step="0.01"
              className={inputClassName}
            />
          </div>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Observações"
            className={textareaClassName}
          />
        </div>
      </AppDialog>

      <ConfirmDialog
        open={Boolean(confirmTarget)}
        onOpenChange={(open) => {
          if (!open) setConfirmTarget(null);
        }}
        title="Inativar saldo"
        description={`O saldo de "${confirmTarget?.product.name ?? ""}" em "${confirmTarget?.inventoryLocation.name ?? ""}" será removido da operação ativa.`}
        confirmLabel="Inativar saldo"
        isPending={deactivateMutation.isPending}
        onConfirm={() => {
          if (!confirmTarget) return;
          deactivateMutation.mutate(confirmTarget.id);
        }}
      />
    </div>
  );
}
