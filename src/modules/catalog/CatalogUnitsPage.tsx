import { supportCatalogApi } from "@/modules/catalog/support-catalog.api";
import type { SupportCatalogUnitDto } from "@/modules/catalog/contracts/support-catalog.dto";
import { queryKeys } from "@/shared/config/query-keys";
import { getApiErrorMessage, handleSecurityError } from "@/shared/lib/http/security";
import { formatDatePtBr } from "@/shared/lib/utils/date";
import { formatBooleanPtBr } from "@/shared/lib/utils/format";
import { AppButton } from "@/shared/ui/components/AppButton";
import { AppCard } from "@/shared/ui/components/AppCard";
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

export function CatalogUnitsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pagination = usePaginationState();
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [editingUnit, setEditingUnit] = useState<SupportCatalogUnitDto | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingSymbol, setEditingSymbol] = useState("");
  const [editingActive, setEditingActive] = useState(true);

  const query = useQuery({
    queryKey: [...queryKeys.supportCatalogUnits, pagination.pagination],
    queryFn: () => supportCatalogApi.listUnits(pagination.pagination),
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (query.error) handleSecurityError(query.error, navigate);
  }, [navigate, query.error]);

  async function invalidateUnits() {
    await queryClient.invalidateQueries({ queryKey: queryKeys.supportCatalogUnits });
  }

  function onMutationError(error: unknown, fallback: string) {
    if (handleSecurityError(error, navigate)) return;
    toast.error(getApiErrorMessage(error, fallback));
  }

  function startEdit(unit: SupportCatalogUnitDto) {
    setEditingUnit(unit);
    setEditingName(unit.name);
    setEditingSymbol(unit.symbol);
    setEditingActive(unit.active);
  }

  const createMutation = useMutation({
    mutationFn: () =>
      supportCatalogApi.createUnit({
        name: name.trim(),
        symbol: symbol.trim(),
      }),
    onSuccess: async () => {
      await invalidateUnits();
      setName("");
      setSymbol("");
      toast.success("Unidade criada com sucesso");
    },
    onError: (error) => onMutationError(error, "Falha ao criar unidade"),
  });

  const updateMutation = useMutation({
    mutationFn: () => {
      if (!editingUnit) throw new Error("Nenhuma unidade selecionada.");
      return supportCatalogApi.updateUnit(editingUnit.id, {
        name: editingName.trim(),
        symbol: editingSymbol.trim(),
        active: editingActive,
      });
    },
    onSuccess: async () => {
      await invalidateUnits();
      setEditingUnit(null);
      toast.success("Unidade atualizada com sucesso");
    },
    onError: (error) => onMutationError(error, "Falha ao atualizar unidade"),
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (payload: { unitId: string; active: boolean }) =>
      supportCatalogApi.updateUnit(payload.unitId, { active: payload.active }),
    onSuccess: async () => {
      await invalidateUnits();
      toast.success("Status da unidade atualizado");
    },
    onError: (error) => onMutationError(error, "Falha ao atualizar status da unidade"),
  });

  const units = query.data?.data ?? [];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Unidades"
        subtitle="Cadastro global de unidades de medida para o catálogo"
        breadcrumb="Operações / Catálogo / Unidades"
        actions={<RefreshIconButton onClick={() => query.refetch()} disabled={query.isFetching} />}
      />

      <section className="grid gap-4 lg:grid-cols-2">
        <AppCard className="space-y-3">
          <h3 className="text-lg font-bold text-[hsl(var(--brand-dark))]">Nova unidade</h3>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Nome da unidade"
            className={inputClassName}
          />
          <input
            value={symbol}
            onChange={(event) => setSymbol(event.target.value)}
            placeholder="Símbolo"
            className={inputClassName}
          />
          <AppButton
            type="button"
            disabled={createMutation.isPending}
            onClick={() => {
              if (!name.trim() || !symbol.trim()) {
                toast.error("Informe nome e símbolo da unidade");
                return;
              }
              createMutation.mutate();
            }}
          >
            {createMutation.isPending ? "Criando..." : "Criar unidade"}
          </AppButton>
        </AppCard>

        {editingUnit ? (
          <AppCard className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-[hsl(var(--brand-dark))]">Editar unidade</h3>
              <AppButton
                type="button"
                variant="ghost"
                className="h-9 px-3"
                onClick={() => setEditingUnit(null)}
              >
                Fechar
              </AppButton>
            </div>
            <input
              value={editingName}
              onChange={(event) => setEditingName(event.target.value)}
              placeholder="Nome da unidade"
              className={inputClassName}
            />
            <input
              value={editingSymbol}
              onChange={(event) => setEditingSymbol(event.target.value)}
              placeholder="Símbolo"
              className={inputClassName}
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={editingActive}
                onChange={(event) => setEditingActive(event.target.checked)}
              />
              Unidade ativa
            </label>
            <AppButton
              type="button"
              disabled={updateMutation.isPending}
              onClick={() => {
                if (!editingName.trim() || !editingSymbol.trim()) {
                  toast.error("Informe nome e símbolo da unidade");
                  return;
                }
                updateMutation.mutate();
              }}
            >
              {updateMutation.isPending ? "Salvando..." : "Salvar unidade"}
            </AppButton>
          </AppCard>
        ) : null}
      </section>

      {units.length === 0 ? (
        <EmptyState
          title="Nenhuma unidade cadastrada"
          description="Crie unidades de medida para liberar o cadastro de produtos."
        />
      ) : (
        <>
          <AppCard className="overflow-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[hsl(var(--surface-muted))]">
                <tr>
                  <th className="px-3 py-2">Nome</th>
                  <th className="px-3 py-2">Símbolo</th>
                  <th className="px-3 py-2">Ativa</th>
                  <th className="px-3 py-2">Atualizada em</th>
                  <th className="px-3 py-2 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {units.map((unit) => (
                  <tr key={unit.id} className="border-t">
                    <td className="px-3 py-2">{unit.name}</td>
                    <td className="px-3 py-2">{unit.symbol}</td>
                    <td className="px-3 py-2">{formatBooleanPtBr(unit.active)}</td>
                    <td className="px-3 py-2">{formatDatePtBr(unit.updatedAt)}</td>
                    <td className="px-3 py-2">
                      <div className="flex justify-end gap-2">
                        <AppButton
                          type="button"
                          variant="ghost"
                          className="h-9 px-3"
                          onClick={() => startEdit(unit)}
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
                              unitId: unit.id,
                              active: !unit.active,
                            })
                          }
                        >
                          {unit.active ? "Inativar" : "Reativar"}
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
            total={query.data?.total ?? 0}
            totalPages={query.data?.totalPages ?? 0}
            onPageChange={pagination.setPage}
            onLimitChange={pagination.setLimit}
          />
        </>
      )}
    </div>
  );
}
