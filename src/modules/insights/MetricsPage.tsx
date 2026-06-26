import { adminOperationsApi } from "@/modules/admin/admin-operations.api";
import { queryKeys } from "@/shared/config/query-keys";
import { AppButton } from "@/shared/ui/components/AppButton";
import { AppCard } from "@/shared/ui/components/AppCard";
import { AppSelect } from "@/shared/ui/components/AppSelect";
import { EmptyState } from "@/shared/ui/components/EmptyState";
import { MetricCard } from "@/shared/ui/components/MetricCard";
import { PageHeader } from "@/shared/ui/components/PageHeader";
import { RefreshIconButton } from "@/shared/ui/components/RefreshIconButton";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Award,
  CheckCircle2,
  Coins,
  FlaskConical,
  TrendingDown,
  TrendingUp,
  TriangleAlert,
} from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { toast } from "sonner";
import { insightsApi } from "./insights.api";
import {
  endOfDayIso,
  fmtCurrency,
  fmtDate,
  fmtDateTime,
  fmtInt,
  fmtNumber,
  startOfDayIso,
  toDateInputValue,
} from "./insights.utils";

const inputClassName = "h-10 w-full rounded-[var(--radius-md)] border bg-white px-3 text-sm";
const labelClassName = "text-xs font-semibold text-[hsl(var(--foreground-muted))]";

function defaultFrom(): string {
  const date = new Date();
  date.setDate(date.getDate() - 30);
  return toDateInputValue(date);
}

interface Row {
  label: string;
  value: string;
}

function InsightCard({
  title,
  icon,
  rows,
  badge,
  highlight,
}: {
  title: string;
  icon: ReactNode;
  rows: Row[];
  badge?: string;
  highlight?: boolean;
}) {
  return (
    <AppCard className={highlight ? "border-amber-300 bg-amber-50" : ""}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className={`rounded-xl p-2 ${
              highlight
                ? "bg-amber-100 text-amber-700"
                : "bg-[hsl(var(--brand-light))] text-[hsl(var(--brand-dark))]"
            }`}
          >
            {icon}
          </span>
          <h3 className="text-sm font-bold text-[hsl(var(--brand-dark))]">{title}</h3>
        </div>
        {badge ? (
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
              highlight
                ? "bg-amber-200 text-amber-900"
                : "bg-[hsl(var(--surface-muted))] text-[hsl(var(--foreground-muted))]"
            }`}
          >
            {badge}
          </span>
        ) : null}
      </div>
      <dl className="mt-3 grid gap-1.5 text-sm">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-2">
            <dt className="text-xs text-[hsl(var(--foreground-muted))]">{row.label}</dt>
            <dd className="text-right font-semibold">{row.value}</dd>
          </div>
        ))}
      </dl>
    </AppCard>
  );
}

interface Applied {
  from: string;
  to: string;
  farmId: string;
}

export function MetricsPage() {
  const queryClient = useQueryClient();
  const today = toDateInputValue(new Date());
  const [from, setFrom] = useState(defaultFrom());
  const [to, setTo] = useState(today);
  const [farmId, setFarmId] = useState("");
  const [applied, setApplied] = useState<Applied>({ from: defaultFrom(), to: today, farmId: "" });

  const farmsQuery = useQuery({
    queryKey: [...queryKeys.farms, "metrics"],
    queryFn: () => adminOperationsApi.listFarms({ page: 1, limit: 100, active: true }),
  });
  const metricsQuery = useQuery({
    queryKey: [...queryKeys.dashboardMetrics, applied],
    queryFn: () =>
      insightsApi.getDashboardMetrics({
        from: startOfDayIso(applied.from),
        to: endOfDayIso(applied.to),
        farmId: applied.farmId || undefined,
      }),
    placeholderData: keepPreviousData,
  });

  const farms = farmsQuery.data?.data ?? [];
  const metrics = metricsQuery.data;

  function apply() {
    if (from > to) {
      toast.error("A data inicial deve ser menor que a final.");
      return;
    }
    setApplied({ from, to, farmId });
  }

  const mostUsed = metrics?.mostUsedProduct ?? null;
  const lowestStock = metrics?.lowestStockProduct ?? null;
  const highestField = metrics?.fieldConsumption.highest ?? null;
  const lowestField = metrics?.fieldConsumption.lowest ?? null;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Métricas"
        subtitle="Indicadores de consumo, custo e estoque das operações"
        breadcrumb="Operações / Métricas"
        actions={
          <RefreshIconButton
            onClick={() => queryClient.invalidateQueries({ queryKey: queryKeys.dashboardMetrics })}
            disabled={metricsQuery.isFetching}
          />
        }
      />

      <AppCard>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="grid gap-1">
            <span className={labelClassName}>De</span>
            <input
              type="date"
              className={inputClassName}
              value={from}
              onChange={(event) => setFrom(event.target.value)}
            />
          </label>
          <label className="grid gap-1">
            <span className={labelClassName}>Até</span>
            <input
              type="date"
              className={inputClassName}
              value={to}
              onChange={(event) => setTo(event.target.value)}
            />
          </label>
          <div className="grid gap-1">
            <span className={labelClassName}>Fazenda</span>
            <AppSelect
              value={farmId}
              onValueChange={(value) => setFarmId(value)}
              options={[
                { value: "", label: "Todas" },
                ...farms.map((farm) => ({ value: farm.id, label: farm.name })),
              ]}
              ariaLabel="Fazenda"
            />
          </div>
          <div className="flex items-end">
            <AppButton
              type="button"
              className="w-full"
              onClick={apply}
              disabled={metricsQuery.isFetching}
            >
              {metricsQuery.isFetching ? "Carregando..." : "Aplicar"}
            </AppButton>
          </div>
        </div>
      </AppCard>

      {metricsQuery.isError ? (
        <EmptyState
          title="Falha ao carregar métricas"
          description="Não foi possível carregar os indicadores do período."
        />
      ) : !metrics ? (
        <EmptyState
          title="Sem dados"
          description="Ajuste os filtros e aplique para ver os indicadores."
        />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Operações Finalizadas"
              value={fmtInt(metrics.operations.totalFinishedOperations)}
              hint="No período selecionado"
              icon={<CheckCircle2 size={18} />}
            />
            <MetricCard
              title="Quantidade Consumida"
              value={fmtNumber(metrics.operations.totalQuantityConsumed)}
              hint="Volume total alocado"
              icon={<FlaskConical size={18} />}
            />
            <MetricCard
              title="Custo Consumido"
              value={fmtCurrency(metrics.operations.totalCostConsumed)}
              hint="Impacto financeiro do período"
              icon={<Coins size={18} />}
            />
            <MetricCard
              title="Produto Mais Usado"
              value={mostUsed?.productName ?? "-"}
              hint={
                mostUsed
                  ? `${mostUsed.productCode} • ${fmtNumber(mostUsed.totalQuantityConsumed)} ${mostUsed.unit}`
                  : "Sem dados"
              }
              icon={<Award size={18} />}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <InsightCard
              title="Produto mais usado"
              icon={<Award size={18} />}
              rows={[
                { label: "Produto", value: mostUsed?.productName ?? "-" },
                { label: "Código", value: mostUsed?.productCode ?? "-" },
                {
                  label: "Quantidade",
                  value: mostUsed
                    ? `${fmtNumber(mostUsed.totalQuantityConsumed)} ${mostUsed.unit}`
                    : "-",
                },
                { label: "Custo", value: mostUsed ? fmtCurrency(mostUsed.totalCostConsumed) : "-" },
                {
                  label: "Itens de operação",
                  value: mostUsed ? fmtInt(mostUsed.operationItemCount) : "-",
                },
              ]}
            />
            <InsightCard
              title="Menor estoque estimado"
              icon={<TriangleAlert size={18} />}
              highlight
              badge={lowestStock ? "Atenção" : "Sem dados"}
              rows={[
                { label: "Produto", value: lowestStock?.productName ?? "-" },
                { label: "Código", value: lowestStock?.productCode ?? "-" },
                {
                  label: "Estoque estimado",
                  value: lowestStock
                    ? `${fmtNumber(lowestStock.estimatedStockQuantity)} ${lowestStock.unit}`
                    : "-",
                },
                { label: "Calculado até", value: fmtDate(lowestStock?.calculatedUntil) },
              ]}
            />
            <InsightCard
              title="Talhão que mais consumiu"
              icon={<TrendingUp size={18} />}
              rows={[
                { label: "Talhão", value: highestField?.fieldName ?? "-" },
                { label: "Fazenda", value: highestField?.farmName ?? "-" },
                {
                  label: "Quantidade",
                  value: highestField
                    ? fmtNumber(highestField.totalAllocatedQuantityConsumed)
                    : "-",
                },
                {
                  label: "Custo",
                  value: highestField ? fmtCurrency(highestField.totalAllocatedCostConsumed) : "-",
                },
              ]}
            />
            <InsightCard
              title="Talhão que menos consumiu"
              icon={<TrendingDown size={18} />}
              rows={[
                { label: "Talhão", value: lowestField?.fieldName ?? "-" },
                { label: "Fazenda", value: lowestField?.farmName ?? "-" },
                {
                  label: "Quantidade",
                  value: lowestField ? fmtNumber(lowestField.totalAllocatedQuantityConsumed) : "-",
                },
                {
                  label: "Custo",
                  value: lowestField ? fmtCurrency(lowestField.totalAllocatedCostConsumed) : "-",
                },
              ]}
            />
          </div>

          <p className="text-xs text-[hsl(var(--foreground-muted))]">
            Última atualização:{" "}
            {metricsQuery.dataUpdatedAt
              ? fmtDateTime(new Date(metricsQuery.dataUpdatedAt).toISOString())
              : "-"}
          </p>
        </>
      )}
    </div>
  );
}
