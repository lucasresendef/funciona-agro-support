import { supportCatalogApi } from "@/modules/catalog/support-catalog.api";
import type { SupportCatalogProductDto } from "@/modules/catalog/contracts/support-catalog.dto";
import { queryKeys } from "@/shared/config/query-keys";
import { getApiErrorMessage, handleSecurityError } from "@/shared/lib/http/security";
import { formatDatePtBr } from "@/shared/lib/utils/date";
import { formatBooleanPtBr } from "@/shared/lib/utils/format";
import { AppButton } from "@/shared/ui/components/AppButton";
import { AppCard } from "@/shared/ui/components/AppCard";
import { AppSelect } from "@/shared/ui/components/AppSelect";
import { EmptyState } from "@/shared/ui/components/EmptyState";
import { PaginationControls } from "@/shared/ui/components/PaginationControls";
import { PageHeader } from "@/shared/ui/components/PageHeader";
import { RefreshIconButton } from "@/shared/ui/components/RefreshIconButton";
import { usePaginationState } from "@/shared/lib/hooks/usePaginationState";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const inputClassName = "h-10 rounded-[var(--radius-md)] border bg-white px-3 text-sm";
const textareaClassName = "min-h-24 rounded-[var(--radius-md)] border bg-white px-3 py-2 text-sm";

export function CatalogProductsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pagination = usePaginationState();

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [activeIngredient, setActiveIngredient] = useState("");
  const [unitOfMeasureId, setUnitOfMeasureId] = useState("");

  const [editingProduct, setEditingProduct] = useState<SupportCatalogProductDto | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingCode, setEditingCode] = useState("");
  const [editingCategory, setEditingCategory] = useState("");
  const [editingDescription, setEditingDescription] = useState("");
  const [editingActiveIngredient, setEditingActiveIngredient] = useState("");
  const [editingUnitOfMeasureId, setEditingUnitOfMeasureId] = useState("");
  const [editingActive, setEditingActive] = useState(true);

  const productsQuery = useQuery({
    queryKey: [...queryKeys.supportCatalogProducts, pagination.pagination],
    queryFn: () => supportCatalogApi.listProducts(pagination.pagination),
    placeholderData: keepPreviousData,
  });

  const unitsQuery = useQuery({
    queryKey: [...queryKeys.supportCatalogUnits, { page: 1, limit: 200, active: true }],
    queryFn: () => supportCatalogApi.listUnits({ page: 1, limit: 200, active: true }),
  });

  useEffect(() => {
    if (productsQuery.error) handleSecurityError(productsQuery.error, navigate);
  }, [navigate, productsQuery.error]);

  useEffect(() => {
    if (unitsQuery.error) handleSecurityError(unitsQuery.error, navigate);
  }, [navigate, unitsQuery.error]);

  async function invalidateCatalog() {
    await queryClient.invalidateQueries({ queryKey: queryKeys.supportCatalogProducts });
    await queryClient.invalidateQueries({ queryKey: queryKeys.supportCatalogUnits });
  }

  function onMutationError(error: unknown, fallback: string) {
    if (handleSecurityError(error, navigate)) return;
    toast.error(getApiErrorMessage(error, fallback));
  }

  function startEdit(product: SupportCatalogProductDto) {
    setEditingProduct(product);
    setEditingName(product.name);
    setEditingCode(product.code);
    setEditingCategory(product.category);
    setEditingDescription(product.description ?? "");
    setEditingActiveIngredient(product.activeIngredient ?? "");
    setEditingUnitOfMeasureId(product.unitOfMeasureId);
    setEditingActive(product.active);
  }

  const createMutation = useMutation({
    mutationFn: () =>
      supportCatalogApi.createProduct({
        name: name.trim(),
        code: code.trim(),
        category: category.trim(),
        description: description.trim() || undefined,
        activeIngredient: activeIngredient.trim() || undefined,
        unitOfMeasureId,
      }),
    onSuccess: async () => {
      await invalidateCatalog();
      setName("");
      setCode("");
      setCategory("");
      setDescription("");
      setActiveIngredient("");
      setUnitOfMeasureId("");
      toast.success("Produto criado com sucesso");
    },
    onError: (error) => onMutationError(error, "Falha ao criar produto"),
  });

  const updateMutation = useMutation({
    mutationFn: () => {
      if (!editingProduct) throw new Error("Nenhum produto selecionado.");
      return supportCatalogApi.updateProduct(editingProduct.id, {
        name: editingName.trim(),
        code: editingCode.trim(),
        category: editingCategory.trim(),
        description: editingDescription.trim() || null,
        activeIngredient: editingActiveIngredient.trim() || null,
        unitOfMeasureId: editingUnitOfMeasureId,
        active: editingActive,
      });
    },
    onSuccess: async () => {
      await invalidateCatalog();
      setEditingProduct(null);
      toast.success("Produto atualizado com sucesso");
    },
    onError: (error) => onMutationError(error, "Falha ao atualizar produto"),
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (payload: { productId: string; active: boolean }) =>
      supportCatalogApi.updateProduct(payload.productId, { active: payload.active }),
    onSuccess: async () => {
      await invalidateCatalog();
      toast.success("Status do produto atualizado");
    },
    onError: (error) => onMutationError(error, "Falha ao atualizar status do produto"),
  });

  const products = productsQuery.data?.data ?? [];
  const units = unitsQuery.data?.data ?? [];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Produtos"
        subtitle="Cadastro global do catálogo de produtos"
        breadcrumb="Operações / Catálogo / Produtos"
        actions={
          <RefreshIconButton
            onClick={() => {
              void queryClient.invalidateQueries({ queryKey: queryKeys.supportCatalogProducts });
              void queryClient.invalidateQueries({ queryKey: queryKeys.supportCatalogUnits });
            }}
            disabled={productsQuery.isFetching || unitsQuery.isFetching}
          />
        }
      />

      {units.length === 0 ? (
        <EmptyState
          title="Cadastre uma unidade primeiro"
          description="Produtos dependem de uma unidade de medida ativa."
        />
      ) : (
        <section className="grid gap-4 lg:grid-cols-2">
          <AppCard className="space-y-3">
            <h3 className="text-lg font-bold text-[hsl(var(--brand-dark))]">Novo produto</h3>
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
            <AppSelect
              value={unitOfMeasureId}
              onValueChange={(value) => setUnitOfMeasureId(value)}
              options={units.map((unit) => ({
                value: unit.id,
                label: `${unit.name} (${unit.symbol})`,
              }))}
              placeholder="Selecione a unidade"
            />
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
            <AppButton
              type="button"
              disabled={createMutation.isPending}
              onClick={() => {
                if (!name.trim() || !code.trim() || !category.trim() || !unitOfMeasureId) {
                  toast.error("Informe nome, código, categoria e unidade do produto");
                  return;
                }
                createMutation.mutate();
              }}
            >
              {createMutation.isPending ? "Criando..." : "Criar produto"}
            </AppButton>
          </AppCard>

          {editingProduct ? (
            <AppCard className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-[hsl(var(--brand-dark))]">Editar produto</h3>
                <AppButton
                  type="button"
                  variant="ghost"
                  className="h-9 px-3"
                  onClick={() => setEditingProduct(null)}
                >
                  Fechar
                </AppButton>
              </div>
              <input
                value={editingName}
                onChange={(event) => setEditingName(event.target.value)}
                placeholder="Nome do produto"
                className={inputClassName}
              />
              <input
                value={editingCode}
                onChange={(event) => setEditingCode(event.target.value)}
                placeholder="Código"
                className={inputClassName}
              />
              <input
                value={editingCategory}
                onChange={(event) => setEditingCategory(event.target.value)}
                placeholder="Categoria"
                className={inputClassName}
              />
              <AppSelect
                value={editingUnitOfMeasureId}
                onValueChange={(value) => setEditingUnitOfMeasureId(value)}
                options={units.map((unit) => ({
                  value: unit.id,
                  label: `${unit.name} (${unit.symbol})`,
                }))}
                placeholder="Selecione a unidade"
              />
              <input
                value={editingActiveIngredient}
                onChange={(event) => setEditingActiveIngredient(event.target.value)}
                placeholder="Ingrediente ativo"
                className={inputClassName}
              />
              <textarea
                value={editingDescription}
                onChange={(event) => setEditingDescription(event.target.value)}
                placeholder="Descrição"
                className={textareaClassName}
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={editingActive}
                  onChange={(event) => setEditingActive(event.target.checked)}
                />
                Produto ativo
              </label>
              <AppButton
                type="button"
                disabled={updateMutation.isPending}
                onClick={() => {
                  if (
                    !editingName.trim() ||
                    !editingCode.trim() ||
                    !editingCategory.trim() ||
                    !editingUnitOfMeasureId
                  ) {
                    toast.error("Informe nome, código, categoria e unidade do produto");
                    return;
                  }
                  updateMutation.mutate();
                }}
              >
                {updateMutation.isPending ? "Salvando..." : "Salvar produto"}
              </AppButton>
            </AppCard>
          ) : null}
        </section>
      )}

      {products.length === 0 ? (
        <EmptyState
          title="Nenhum produto cadastrado"
          description="Crie produtos no catálogo global para disponibilizar nas operações."
        />
      ) : (
        <>
          <AppCard className="overflow-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[hsl(var(--surface-muted))]">
                <tr>
                  <th className="px-3 py-2">Nome</th>
                  <th className="px-3 py-2">Código</th>
                  <th className="px-3 py-2">Categoria</th>
                  <th className="px-3 py-2">Unidade</th>
                  <th className="px-3 py-2">Ativo</th>
                  <th className="px-3 py-2">Atualizado em</th>
                  <th className="px-3 py-2 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-t">
                    <td className="px-3 py-2">{product.name}</td>
                    <td className="px-3 py-2">{product.code}</td>
                    <td className="px-3 py-2">{product.category}</td>
                    <td className="px-3 py-2">
                      {product.unitOfMeasure.name} ({product.unitOfMeasure.symbol})
                    </td>
                    <td className="px-3 py-2">{formatBooleanPtBr(product.active)}</td>
                    <td className="px-3 py-2">{formatDatePtBr(product.updatedAt)}</td>
                    <td className="px-3 py-2">
                      <div className="flex justify-end gap-2">
                        <AppButton
                          type="button"
                          variant="ghost"
                          className="h-9 px-3"
                          onClick={() => startEdit(product)}
                        >
                          Editar
                        </AppButton>
                        <AppButton
                          type="button"
                          variant="ghost"
                          className="h-9 px-3"
                          disabled={toggleStatusMutation.isPending}
                          onClick={() =>
                            toggleStatusMutation.mutate({
                              productId: product.id,
                              active: !product.active,
                            })
                          }
                        >
                          {product.active ? "Inativar" : "Reativar"}
                        </AppButton>
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
            total={productsQuery.data?.total ?? 0}
            totalPages={productsQuery.data?.totalPages ?? 0}
            onPageChange={pagination.setPage}
            onLimitChange={pagination.setLimit}
          />
        </>
      )}
    </div>
  );
}
