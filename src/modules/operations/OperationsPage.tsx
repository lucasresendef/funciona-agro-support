import { adminOperationsApi } from "@/modules/admin/admin-operations.api";
import { queryKeys } from "@/shared/config/query-keys";
import { AppButton } from "@/shared/ui/components/AppButton";
import { AppCard } from "@/shared/ui/components/AppCard";
import { AppSelect } from "@/shared/ui/components/AppSelect";
import { EmptyState } from "@/shared/ui/components/EmptyState";
import { PageHeader } from "@/shared/ui/components/PageHeader";
import { PaginationControls } from "@/shared/ui/components/PaginationControls";
import { RefreshIconButton } from "@/shared/ui/components/RefreshIconButton";
import { usePaginationState } from "@/shared/lib/hooks/usePaginationState";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronRight, Sprout } from "lucide-react";
import { useMemo, useState } from "react";
import { CreateOperationDialog } from "./components/CreateOperationDialog";
import { FinalizeOperationDialog } from "./components/FinalizeOperationDialog";
import { OperationSummaryDialog } from "./components/OperationSummaryDialog";
import { operationsApi } from "./operations.api";
import type { FieldOperationEntity, StatusScope } from "./operations.types";
import { STATUS_SCOPES } from "./operations.types";
import {
  STATUS_BADGE_CLASS,
  STATUS_LABEL,
  fieldNames,
  formatDateTime,
  matchesSearch,
  operationLabel,
} from "./operations.utils";

const SCOPE_OPTIONS: { value: StatusScope; label: string }[] = [
  { value: "openAndFinished", label: "Abertas + finalizadas" },
  { value: "open", label: "Abertas" },
  { value: "finished", label: "Finalizadas" },
  { value: "canceled", label: "Canceladas" },
];

const inputClassName = "h-10 w-full rounded-[var(--radius-md)] border bg-white px-3 text-sm";

export function OperationsPage() {
  const queryClient = useQueryClient();
  const pagination = usePaginationState();
  const [scope, setScope] = useState<StatusScope>("openAndFinished");
  const [search, setSearch] = useState("");
  const [fieldId, setFieldId] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [finalizeTarget, setFinalizeTarget] = useState<FieldOperationEntity | null>(null);
  const [summaryTarget, setSummaryTarget] = useState<FieldOperationEntity | null>(null);

  const scopeStatuses = STATUS_SCOPES[scope];
  const statusParam = scopeStatuses.length === 1 ? scopeStatuses[0] : undefined;

  const operationsQuery = useQuery({
    queryKey: [...queryKeys.fieldOperations, pagination.pagination, statusParam ?? "all", fieldId],
    queryFn: () =>
      operationsApi.list({
        page: pagination.page,
        limit: pagination.limit,
        status: statusParam,
        fieldId: fieldId || undefined,
      }),
    placeholderData: keepPreviousData,
  });

  const fieldsQuery = useQuery({
    queryKey: [...queryKeys.fields, "op-filter"],
    queryFn: () => adminOperationsApi.listFields({ page: 1, limit: 100, active: true }),
  });
  const fields = fieldsQuery.data?.data ?? [];

  function invalidate() {
    void queryClient.invalidateQueries({ queryKey: queryKeys.fieldOperations });
  }

  const operations = useMemo(() => {
    const raw = operationsQuery.data?.data ?? [];
    return raw
      .filter((op) => scopeStatuses.includes(op.status))
      .filter((op) => (search.trim() ? matchesSearch(op, search) : true));
  }, [operationsQuery.data, scopeStatuses, search]);

  function openOperation(operation: FieldOperationEntity) {
    if (operation.status === "OPEN") {
      setFinalizeTarget(operation);
    } else {
      setSummaryTarget(operation);
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Operações"
        subtitle="Envio de produtos aos talhões e devolutiva de consumo"
        breadcrumb="Operações / Campo"
        actions={
          <div className="flex items-center gap-2">
            <RefreshIconButton onClick={invalidate} disabled={operationsQuery.isFetching} />
            <AppButton type="button" onClick={() => setCreateOpen(true)}>
              Nova operação
            </AppButton>
          </div>
        }
      />

      <div className="grid gap-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            className={inputClassName}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por produto, talhão, descrição..."
          />
          <AppSelect
            value={fieldId}
            onValueChange={(value) => {
              setFieldId(value);
              pagination.setPage(1);
            }}
            options={[
              { value: "", label: "Todos os talhões" },
              ...fields.map((field) => ({ value: field.id, label: field.name })),
            ]}
          />
        </div>
        <div className="sm:hidden">
          <AppSelect
            value={scope}
            onValueChange={(value) => {
              setScope(value as StatusScope);
              pagination.setPage(1);
            }}
            options={SCOPE_OPTIONS.map((option) => ({ value: option.value, label: option.label }))}
            ariaLabel="Filtrar operações por status"
          />
        </div>
        <div className="hidden gap-1 rounded-[var(--radius-lg)] border bg-white p-1 sm:grid sm:grid-cols-4">
          {SCOPE_OPTIONS.map((option) => {
            const active = option.value === scope;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setScope(option.value);
                  pagination.setPage(1);
                }}
                className={`flex items-center justify-center rounded-[var(--radius-md)] px-2 py-1.5 text-center text-xs font-semibold transition ${
                  active
                    ? "brand-gradient text-white shadow-[var(--shadow-soft)]"
                    : "text-[hsl(var(--foreground-muted))] hover:bg-[hsl(var(--surface-muted))]"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {operationsQuery.isError ? (
        <EmptyState
          title="Erro ao carregar operações"
          description="Não foi possível carregar a listagem."
        />
      ) : operations.length === 0 ? (
        <EmptyState
          title="Nenhuma operação encontrada"
          description="Crie uma operação para começar o acompanhamento de consumo no campo."
          actionLabel="Nova operação"
          onAction={() => setCreateOpen(true)}
        />
      ) : (
        <>
          <div className="grid gap-2">
            {operations.map((operation) => (
              <button
                key={operation.id}
                type="button"
                onClick={() => openOperation(operation)}
                className="text-left"
              >
                <AppCard className="flex items-center gap-3 transition hover:border-[hsl(var(--brand-dark))]">
                  <span className="hidden rounded-xl bg-[hsl(var(--brand-light))] p-2 text-[hsl(var(--brand-dark))] sm:inline-flex">
                    <Sprout size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-[hsl(var(--brand-dark))]">
                        {operationLabel(operation)}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATUS_BADGE_CLASS[operation.status]}`}
                      >
                        {STATUS_LABEL[operation.status]}
                      </span>
                    </div>
                    <p className="truncate text-xs text-[hsl(var(--foreground-muted))]">
                      Talhões: {fieldNames(operation).join(", ") || "-"}
                    </p>
                    <p className="text-xs text-[hsl(var(--foreground-muted))]">
                      {operation.items?.length ?? 0} item(ns) ·{" "}
                      {formatDateTime(operation.operationDate)}
                    </p>
                  </div>
                  <ChevronRight size={18} className="text-[hsl(var(--foreground-muted))]" />
                </AppCard>
              </button>
            ))}
          </div>

          <PaginationControls
            page={pagination.page}
            limit={pagination.limit}
            total={operationsQuery.data?.total ?? 0}
            totalPages={operationsQuery.data?.totalPages ?? 0}
            onPageChange={pagination.setPage}
            onLimitChange={pagination.setLimit}
          />
        </>
      )}

      <CreateOperationDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={invalidate}
      />
      <FinalizeOperationDialog
        operation={finalizeTarget}
        open={finalizeTarget !== null}
        onOpenChange={(open) => {
          if (!open) setFinalizeTarget(null);
        }}
        onFinished={invalidate}
      />
      <OperationSummaryDialog
        operation={summaryTarget}
        open={summaryTarget !== null}
        onOpenChange={(open) => {
          if (!open) setSummaryTarget(null);
        }}
      />
    </div>
  );
}
