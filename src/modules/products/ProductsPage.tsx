import { adminOperationsApi } from "@/modules/admin/admin-operations.api";
import type {
  InventoryLocationEntity,
  ProductEntity,
  UnitEntity,
} from "@/modules/admin/contracts/admin-operations.dto";
import { useAuth } from "@/modules/auth/AuthContext";
import { isAppAdmin } from "@/shared/config/permissions";
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

export function ProductsPage() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const canManage = isAppAdmin(profile);
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | null>(null);
  const [targetProduct, setTargetProduct] = useState<ProductEntity | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<ProductEntity | null>(null);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [activeIngredient, setActiveIngredient] = useState("");
  const [unitOfMeasureId, setUnitOfMeasureId] = useState("");
  const [farmId, setFarmId] = useState("");
  const [inventoryLocationId, setInventoryLocationId] = useState("");
  const [quantity, setQuantity] = useState("0");
  const [averageUnitCost, setAverageUnitCost] = useState("0");

  const productsQuery = useQuery({
    queryKey: [...queryKeys.products, { page: 1, limit: 100 }],
    queryFn: () => adminOperationsApi.listProducts({ page: 1, limit: 100 }),
  });

  const unitsQuery = useQuery({
    queryKey: [...queryKeys.units, { page: 1, limit: 100, active: true }],
    queryFn: () => adminOperationsApi.listUnits({ page: 1, limit: 100, active: true }),
    enabled: dialogMode !== null,
  });

  const farmsQuery = useQuery({
    queryKey: [...queryKeys.farms, { page: 1, limit: 100, active: true }],
    queryFn: () => adminOperationsApi.listFarms({ page: 1, limit: 100, active: true }),
    enabled: dialogMode === "create",
  });

  const inventoryLocationsQuery = useQuery({
    queryKey: [...queryKeys.inventoryLocations, { page: 1, limit: 100, active: true }],
    queryFn: () => adminOperationsApi.listInventoryLocations({ page: 1, limit: 100, active: true }),
    enabled: dialogMode === "create",
  });

  const filteredLocations = useMemo(
    () =>
      (inventoryLocationsQuery.data?.data ?? []).filter(
        (location: InventoryLocationEntity) => !farmId || location.farmId === farmId,
      ),
    [farmId, inventoryLocationsQuery.data?.data],
  );

  async function invalidateProducts() {
    await queryClient.invalidateQueries({ queryKey: queryKeys.products });
  }

  function onError(error: unknown, fallback: string) {
    toast.error(getApiErrorMessage(error, fallback));
  }

  function openCreateDialog() {
    setTargetProduct(null);
    setName("");
    setCode("");
    setCategory("");
    setDescription("");
    setActiveIngredient("");
    setUnitOfMeasureId("");
    setFarmId("");
    setInventoryLocationId("");
    setQuantity("0");
    setAverageUnitCost("0");
    setDialogMode("create");
  }

  function openEditDialog(product: ProductEntity) {
    setTargetProduct(product);
    setName(product.name);
    setCode(product.code);
    setCategory(product.category);
    setDescription(product.description ?? "");
    setActiveIngredient(product.activeIngredient ?? "");
    setUnitOfMeasureId(product.unitOfMeasureId);
    setFarmId("");
    setInventoryLocationId("");
    setQuantity("0");
    setAverageUnitCost("0");
    setDialogMode("edit");
  }

  function closeDialog() {
    setDialogMode(null);
    setTargetProduct(null);
  }

  const createMutation = useMutation({
    mutationFn: () =>
      adminOperationsApi.createProduct({
        name: name.trim(),
        code: code.trim(),
        category: category.trim(),
        description: description.trim() || undefined,
        activeIngredient: activeIngredient.trim() || undefined,
        unitOfMeasureId,
        stockByLocation: [
          {
            farmId,
            inventoryLocationId,
            quantity: Number(quantity),
            averageUnitCost: Number(averageUnitCost),
          },
        ],
      }),
    onSuccess: async () => {
      await invalidateProducts();
      closeDialog();
      toast.success("Produto criado com sucesso");
    },
    onError: (error) => onError(error, "Falha ao criar produto"),
  });

  const updateMutation = useMutation({
    mutationFn: () => {
      if (!targetProduct) throw new Error("Nenhum produto selecionado.");
      return adminOperationsApi.updateProduct(targetProduct.id, {
        name: name.trim(),
        code: code.trim(),
        category: category.trim(),
        description: description.trim() || null,
        activeIngredient: activeIngredient.trim() || null,
        unitOfMeasureId,
      });
    },
    onSuccess: async () => {
      await invalidateProducts();
      closeDialog();
      toast.success("Produto atualizado com sucesso");
    },
    onError: (error) => onError(error, "Falha ao atualizar produto"),
  });

  const deactivateMutation = useMutation({
    mutationFn: (productId: string) => adminOperationsApi.deactivateProduct(productId),
    onSuccess: async () => {
      await invalidateProducts();
      setConfirmTarget(null);
      toast.success("Produto inativado com sucesso");
    },
    onError: (error) => onError(error, "Falha ao inativar produto"),
  });

  const products = productsQuery.data?.data ?? [];
  const units = unitsQuery.data?.data ?? [];
  const farms = farmsQuery.data?.data ?? [];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Produtos"
        subtitle="Cadastro de produtos com estoque inicial"
        breadcrumb="Operações / Produtos"
        actions={
          <div className="flex items-center gap-2">
            <RefreshIconButton
              onClick={() => {
                void queryClient.invalidateQueries({ queryKey: queryKeys.products });
                void queryClient.invalidateQueries({ queryKey: queryKeys.units });
                void queryClient.invalidateQueries({ queryKey: queryKeys.farms });
                void queryClient.invalidateQueries({ queryKey: queryKeys.inventoryLocations });
              }}
              disabled={
                productsQuery.isFetching ||
                unitsQuery.isFetching ||
                farmsQuery.isFetching ||
                inventoryLocationsQuery.isFetching
              }
            />
            {canManage ? (
              <AppButton type="button" onClick={openCreateDialog}>
                Novo produto
              </AppButton>
            ) : null}
          </div>
        }
      />

      {productsQuery.isError ? (
        <EmptyState
          title="Erro ao carregar produtos"
          description="Não foi possível carregar a listagem."
        />
      ) : products.length === 0 ? (
        <EmptyState
          title="Nenhum produto cadastrado"
          description="Cadastre produtos para usar no estoque e nas operações."
          actionLabel={canManage ? "Novo produto" : undefined}
          onAction={canManage ? openCreateDialog : undefined}
        />
      ) : (
        <AppCard className="overflow-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[hsl(var(--surface-muted))]">
              <tr>
                <th className="px-3 py-2">Nome</th>
                <th className="px-3 py-2">Código</th>
                <th className="px-3 py-2">Categoria</th>
                <th className="px-3 py-2">Unidade</th>
                <th className="px-3 py-2">Estoque total</th>
                <th className="px-3 py-2">Status</th>
                {canManage ? <th className="px-3 py-2 text-right">Ações</th> : null}
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-t">
                  <td className="px-3 py-2">{product.name}</td>
                  <td className="px-3 py-2">{product.code}</td>
                  <td className="px-3 py-2">{product.category}</td>
                  <td className="px-3 py-2">{product.unitOfMeasure.symbol}</td>
                  <td className="px-3 py-2">{product.totalStockQuantity}</td>
                  <td className="px-3 py-2">{product.active ? "Ativo" : "Inativo"}</td>
                  {canManage ? (
                    <td className="px-3 py-2">
                      <div className="flex justify-end gap-2">
                        <TableIconButton
                          aria-label={`Editar ${product.name}`}
                          onClick={() => openEditDialog(product)}
                        >
                          <Pencil size={16} />
                        </TableIconButton>
                        <TableIconButton
                          aria-label={`Inativar ${product.name}`}
                          variant="danger"
                          disabled={deactivateMutation.isPending}
                          onClick={() => setConfirmTarget(product)}
                        >
                          <Trash2 size={16} />
                        </TableIconButton>
                      </div>
                    </td>
                  ) : null}
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
        title={dialogMode === "edit" ? "Editar produto" : "Novo produto"}
        description="Use um único formulário para criação e edição. O estoque inicial aparece apenas na criação."
        footer={
          <>
            <AppButton type="button" variant="ghost" onClick={closeDialog}>
              Cancelar
            </AppButton>
            <AppButton
              type="button"
              disabled={createMutation.isPending || updateMutation.isPending}
              onClick={() => {
                if (!name.trim() || !code.trim() || !category.trim() || !unitOfMeasureId) {
                  toast.error("Informe nome, código, categoria e unidade");
                  return;
                }
                if (dialogMode === "create" && (!farmId || !inventoryLocationId)) {
                  toast.error("Preencha o estoque inicial do produto");
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
                  ? "Salvar produto"
                  : "Criar produto"}
            </AppButton>
          </>
        }
      >
        <div className="grid gap-3">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Nome do produto"
            className={inputClassName}
          />
          <input
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="Código"
            className={inputClassName}
          />
          <input
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            placeholder="Categoria"
            className={inputClassName}
          />
          <select
            value={unitOfMeasureId}
            onChange={(event) => setUnitOfMeasureId(event.target.value)}
            className={inputClassName}
          >
            <option value="">Selecione a unidade</option>
            {units.map((unit: UnitEntity) => (
              <option key={unit.id} value={unit.id}>
                {unit.name} ({unit.symbol})
              </option>
            ))}
          </select>
          <input
            value={activeIngredient}
            onChange={(event) => setActiveIngredient(event.target.value)}
            placeholder="Ingrediente ativo"
            className={inputClassName}
          />
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Descrição"
            className={textareaClassName}
          />

          {dialogMode === "create" ? (
            <>
              <div className="pt-2 text-sm font-semibold text-[hsl(var(--brand-dark))]">
                Estoque inicial
              </div>
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
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  value={quantity}
                  onChange={(event) => setQuantity(event.target.value)}
                  placeholder="Quantidade inicial"
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
            </>
          ) : null}
        </div>
      </AppDialog>

      <ConfirmDialog
        open={Boolean(confirmTarget)}
        onOpenChange={(open) => {
          if (!open) setConfirmTarget(null);
        }}
        title="Inativar produto"
        description={`O produto "${confirmTarget?.name ?? ""}" será removido da operação ativa.`}
        confirmLabel="Inativar produto"
        isPending={deactivateMutation.isPending}
        onConfirm={() => {
          if (!confirmTarget) return;
          deactivateMutation.mutate(confirmTarget.id);
        }}
      />
    </div>
  );
}
