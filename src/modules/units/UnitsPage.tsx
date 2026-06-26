import { adminOperationsApi } from "@/modules/admin/admin-operations.api";
import type { UnitEntity } from "@/modules/admin/contracts/admin-operations.dto";
import { useAuth } from "@/modules/auth/AuthContext";
import { isPortalAdmin } from "@/shared/config/permissions";
import { queryKeys } from "@/shared/config/query-keys";
import { getApiErrorMessage } from "@/shared/lib/http/security";
import { AppButton } from "@/shared/ui/components/AppButton";
import { AppCard } from "@/shared/ui/components/AppCard";
import { AppDialog } from "@/shared/ui/components/AppDialog";
import { ConfirmDialog } from "@/shared/ui/components/ConfirmDialog";
import { EmptyState } from "@/shared/ui/components/EmptyState";
import { PaginationControls } from "@/shared/ui/components/PaginationControls";
import { PageHeader } from "@/shared/ui/components/PageHeader";
import { SearchInput } from "@/shared/ui/components/SearchInput";
import { StatusFilter } from "@/shared/ui/components/StatusFilter";
import { TableIconButton } from "@/shared/ui/components/TableIconButton";
import { useDebouncedValue } from "@/shared/lib/hooks/useDebouncedValue";
import { usePaginationState } from "@/shared/lib/hooks/usePaginationState";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const inputClassName = "h-10 rounded-[var(--radius-md)] border bg-white px-3 text-sm";

export function UnitsPage() {
  const queryClient = useQueryClient();
  const pagination = usePaginationState();
  const { profile } = useAuth();
  const canManage = isPortalAdmin(profile);
  const [showActive, setShowActive] = useState(true);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | null>(null);
  const [targetUnit, setTargetUnit] = useState<UnitEntity | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<UnitEntity | null>(null);
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");

  const query = useQuery({
    queryKey: [...queryKeys.units, pagination.pagination, showActive, debouncedSearch],
    queryFn: () =>
      adminOperationsApi.listUnits({
        ...pagination.pagination,
        active: showActive,
        search: debouncedSearch.trim() || undefined,
      }),
    placeholderData: keepPreviousData,
  });

  async function invalidateUnits() {
    await queryClient.invalidateQueries({ queryKey: queryKeys.units });
  }

  function onError(error: unknown, fallback: string) {
    toast.error(getApiErrorMessage(error, fallback));
  }

  function openCreateDialog() {
    setTargetUnit(null);
    setName("");
    setSymbol("");
    setDialogMode("create");
  }

  function openEditDialog(unit: UnitEntity) {
    setTargetUnit(unit);
    setName(unit.name);
    setSymbol(unit.symbol);
    setDialogMode("edit");
  }

  function closeDialog() {
    setDialogMode(null);
    setTargetUnit(null);
  }

  const createMutation = useMutation({
    mutationFn: () =>
      adminOperationsApi.createUnit({
        name: name.trim(),
        symbol: symbol.trim(),
      }),
    onSuccess: async () => {
      await invalidateUnits();
      closeDialog();
      toast.success("Unidade criada com sucesso");
    },
    onError: (error) => onError(error, "Falha ao criar unidade"),
  });

  const updateMutation = useMutation({
    mutationFn: () => {
      if (!targetUnit) throw new Error("Nenhuma unidade selecionada.");
      return adminOperationsApi.updateUnit(targetUnit.id, {
        name: name.trim(),
        symbol: symbol.trim(),
      });
    },
    onSuccess: async () => {
      await invalidateUnits();
      closeDialog();
      toast.success("Unidade atualizada com sucesso");
    },
    onError: (error) => onError(error, "Falha ao atualizar unidade"),
  });

  const deactivateMutation = useMutation({
    mutationFn: (unitId: string) => adminOperationsApi.deactivateUnit(unitId),
    onSuccess: async () => {
      await invalidateUnits();
      setConfirmTarget(null);
      toast.success("Unidade inativada com sucesso");
    },
    onError: (error) => onError(error, "Falha ao inativar unidade"),
  });

  const units = query.data?.data ?? [];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Unidades"
        subtitle="Cadastro de unidades de medida"
        breadcrumb="Operações / Unidades"
        actions={
          <div className="flex items-center gap-2">
            <StatusFilter
              value={showActive}
              onChange={(active) => {
                setShowActive(active);
                pagination.setPage(1);
              }}
            />
            {canManage ? (
              <AppButton type="button" onClick={openCreateDialog}>
                Nova unidade
              </AppButton>
            ) : null}
          </div>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput
          value={search}
          onChange={(value) => {
            setSearch(value);
            pagination.setPage(1);
          }}
          placeholder="Buscar unidade..."
          className="w-full sm:max-w-xs"
        />
      </div>

      {query.isError ? (
        <EmptyState
          title="Erro ao carregar unidades"
          description="Não foi possível carregar a listagem."
        />
      ) : units.length === 0 ? (
        <EmptyState
          title="Nenhuma unidade cadastrada"
          description="Crie unidades de medida para usar nos produtos."
          actionLabel={canManage ? "Nova unidade" : undefined}
          onAction={canManage ? openCreateDialog : undefined}
        />
      ) : (
        <>
          <AppCard className="overflow-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[hsl(var(--surface-muted))]">
                <tr>
                  <th className="px-3 py-2">Nome</th>
                  <th className="px-3 py-2">Símbolo</th>
                  {canManage ? <th className="px-3 py-2 text-right">Ações</th> : null}
                </tr>
              </thead>
              <tbody>
                {units.map((unit) => (
                  <tr key={unit.id} className="border-t">
                    <td className="px-3 py-2">{unit.name}</td>
                    <td className="px-3 py-2">{unit.symbol}</td>
                    {canManage ? (
                      <td className="px-3 py-2">
                        <div className="flex justify-end gap-2">
                          <TableIconButton
                            aria-label={`Editar ${unit.name}`}
                            onClick={() => openEditDialog(unit)}
                          >
                            <Pencil size={16} />
                          </TableIconButton>
                          <TableIconButton
                            aria-label={`Inativar ${unit.name}`}
                            variant="danger"
                            disabled={deactivateMutation.isPending}
                            onClick={() => setConfirmTarget(unit)}
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

      <AppDialog
        open={dialogMode !== null}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
        title={dialogMode === "edit" ? "Editar unidade" : "Nova unidade"}
        description="O mesmo formulário é usado para criar e editar a unidade."
        footer={
          <>
            <AppButton type="button" variant="ghost" onClick={closeDialog}>
              Cancelar
            </AppButton>
            <AppButton
              type="button"
              disabled={createMutation.isPending || updateMutation.isPending}
              onClick={() => {
                if (!name.trim() || !symbol.trim()) {
                  toast.error("Informe nome e símbolo da unidade");
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
                  ? "Salvar unidade"
                  : "Criar unidade"}
            </AppButton>
          </>
        }
      >
        <div className="grid gap-3">
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
        </div>
      </AppDialog>

      <ConfirmDialog
        open={Boolean(confirmTarget)}
        onOpenChange={(open) => {
          if (!open) setConfirmTarget(null);
        }}
        title="Inativar unidade"
        description={`A unidade "${confirmTarget?.name ?? ""}" será removida da operação ativa.`}
        confirmLabel="Inativar unidade"
        isPending={deactivateMutation.isPending}
        onConfirm={() => {
          if (!confirmTarget) return;
          deactivateMutation.mutate(confirmTarget.id);
        }}
      />
    </div>
  );
}
