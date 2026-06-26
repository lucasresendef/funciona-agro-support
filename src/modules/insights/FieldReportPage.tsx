import { adminOperationsApi } from "@/modules/admin/admin-operations.api";
import { queryKeys } from "@/shared/config/query-keys";
import { getApiErrorMessage } from "@/shared/lib/http/security";
import { AppButton } from "@/shared/ui/components/AppButton";
import { AppCard } from "@/shared/ui/components/AppCard";
import { AppSelect } from "@/shared/ui/components/AppSelect";
import { EmptyState } from "@/shared/ui/components/EmptyState";
import { PageHeader } from "@/shared/ui/components/PageHeader";
import { useQuery } from "@tanstack/react-query";
import { Download, Share2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { insightsApi } from "./insights.api";
import {
  downloadNodeAsImage,
  endOfDayIso,
  fmtCurrency,
  fmtDate,
  fmtInt,
  fmtNumber,
  shareNodeAsImage,
  startOfDayIso,
  toDateInputValue,
} from "./insights.utils";

const inputClassName = "h-10 w-full rounded-[var(--radius-md)] border bg-white px-3 text-sm";
const labelClassName = "text-xs font-semibold text-[hsl(var(--foreground-muted))]";

function defaultFrom(): string {
  const date = new Date();
  date.setDate(date.getDate() - 7);
  return toDateInputValue(date);
}

interface Applied {
  fieldId: string;
  from: string;
  to: string;
}

function KpiBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--radius-md)] border bg-white p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-[hsl(var(--foreground-muted))]">
        {label}
      </p>
      <p className="mt-1 text-xl font-extrabold text-[hsl(var(--brand-dark))]">{value}</p>
    </div>
  );
}

export function FieldReportPage() {
  const reportRef = useRef<HTMLDivElement>(null);
  const [farmId, setFarmId] = useState("");
  const [fieldId, setFieldId] = useState("");
  const [from, setFrom] = useState(defaultFrom());
  const [to, setTo] = useState(toDateInputValue(new Date()));
  const [applied, setApplied] = useState<Applied | null>(null);
  const [busy, setBusy] = useState(false);

  const farmsQuery = useQuery({
    queryKey: [...queryKeys.farms, "report"],
    queryFn: () => adminOperationsApi.listFarms({ page: 1, limit: 100, active: true }),
  });
  const fieldsQuery = useQuery({
    queryKey: [...queryKeys.fields, "report", farmId],
    queryFn: () => adminOperationsApi.listFields({ page: 1, limit: 100, farmId, active: true }),
    enabled: Boolean(farmId),
  });
  const reportQuery = useQuery({
    queryKey: [...queryKeys.fieldConsumption, applied],
    queryFn: () =>
      insightsApi.getFieldConsumption({
        fieldId: applied?.fieldId ?? "",
        from: startOfDayIso(applied?.from ?? ""),
        to: endOfDayIso(applied?.to ?? ""),
      }),
    enabled: applied !== null,
  });

  const farms = farmsQuery.data?.data ?? [];
  const fields = fieldsQuery.data?.data ?? [];
  const report = reportQuery.data;

  function consult() {
    if (!fieldId) {
      toast.error("Selecione o talhão.");
      return;
    }
    if (!from || !to) {
      toast.error("Informe o período.");
      return;
    }
    if (from > to) {
      toast.error("A data inicial deve ser menor que a final.");
      return;
    }
    setApplied({ fieldId, from, to });
  }

  async function handleDownload() {
    if (!reportRef.current || !report) return;
    setBusy(true);
    try {
      await downloadNodeAsImage(reportRef.current, `consumo-talhao-${report.fieldName}`);
      toast.success("Imagem baixada");
    } catch {
      toast.error("Falha ao gerar a imagem");
    } finally {
      setBusy(false);
    }
  }

  async function handleShare() {
    if (!reportRef.current || !report) return;
    setBusy(true);
    try {
      const result = await shareNodeAsImage(
        reportRef.current,
        `consumo-talhao-${report.fieldName}`,
        `Relatório de consumo - ${report.fieldName} (${fmtDate(report.period.from)} a ${fmtDate(report.period.to)})`,
      );
      toast.success(
        result === "shared" ? "Compartilhado" : "Compartilhamento indisponível — imagem baixada",
      );
    } catch {
      toast.error("Falha ao compartilhar");
    } finally {
      setBusy(false);
    }
  }

  const totalQty = report?.summary.totalAllocatedQuantityConsumed ?? 0;
  const unitLabel =
    report && report.items.length > 0
      ? new Set(report.items.map((item) => item.unit)).size === 1
        ? report.items[0].unit
        : "un."
      : "un.";
  const topItem =
    report && report.items.length > 0
      ? [...report.items].sort(
          (a, b) => b.totalAllocatedQuantityConsumed - a.totalAllocatedQuantityConsumed,
        )[0]
      : null;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Relatório por talhão"
        subtitle="Consumo de insumos por talhão no período"
        breadcrumb="Operações / Relatórios"
      />

      <AppCard>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="grid gap-1">
            <span className={labelClassName}>Fazenda</span>
            <AppSelect
              value={farmId}
              onValueChange={(value) => {
                setFarmId(value);
                setFieldId("");
              }}
              options={farms.map((farm) => ({ value: farm.id, label: farm.name }))}
              placeholder="Selecione"
              ariaLabel="Fazenda"
            />
          </div>
          <div className="grid gap-1">
            <span className={labelClassName}>Talhão</span>
            <AppSelect
              value={fieldId}
              onValueChange={(value) => setFieldId(value)}
              options={fields.map((field) => ({ value: field.id, label: field.name }))}
              placeholder="Selecione"
              disabled={!farmId}
              ariaLabel="Talhão"
            />
          </div>
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
        </div>
        <div className="mt-3">
          <AppButton type="button" onClick={consult} disabled={reportQuery.isFetching}>
            {reportQuery.isFetching ? "Consultando..." : "Consultar consumo"}
          </AppButton>
        </div>
      </AppCard>

      {reportQuery.isError ? (
        <EmptyState
          title="Erro ao gerar relatório"
          description={getApiErrorMessage(reportQuery.error, "Não foi possível gerar o relatório.")}
        />
      ) : !report ? (
        <EmptyState
          title="Selecione um talhão e o período"
          description="O relatório aparece aqui após a consulta, com opção de baixar ou compartilhar como imagem."
        />
      ) : (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <AppButton type="button" variant="secondary" onClick={handleDownload} disabled={busy}>
              <Download size={16} />
              <span className="ml-1">Baixar imagem</span>
            </AppButton>
            <AppButton type="button" variant="secondary" onClick={handleShare} disabled={busy}>
              <Share2 size={16} />
              <span className="ml-1">Compartilhar</span>
            </AppButton>
          </div>

          <div ref={reportRef} className="grid gap-3 rounded-[var(--radius-lg)] bg-white p-4">
            <div className="rounded-[var(--radius-md)] bg-[hsl(var(--brand-light))] p-4">
              <p className="text-lg font-bold text-[hsl(var(--brand-dark))]">{report.fieldName}</p>
              <p className="text-sm text-[hsl(var(--foreground-muted))]">{report.farmName}</p>
              <span className="mt-2 inline-block rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-[hsl(var(--brand-dark))]">
                Período {fmtDate(report.period.from)} - {fmtDate(report.period.to)}
              </span>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <KpiBox label="Quantidade total" value={`${fmtNumber(totalQty)} ${unitLabel}`} />
              <KpiBox
                label="Custo total"
                value={fmtCurrency(report.summary.totalAllocatedCostConsumed)}
              />
              <KpiBox label="Operações" value={fmtInt(report.summary.operationCount)} />
              <KpiBox label="Insumos" value={fmtInt(report.summary.itemCount)} />
            </div>

            {topItem ? (
              <div className="rounded-[var(--radius-md)] border bg-[#f6f9f6] p-3">
                <p className="text-sm font-extrabold text-[hsl(var(--brand-dark))]">
                  Destaque do período
                </p>
                <p className="text-sm font-semibold">
                  {topItem.productCode} - {topItem.productName}
                </p>
                <p className="text-xs text-[hsl(var(--foreground-muted))]">
                  {fmtNumber(topItem.totalAllocatedQuantityConsumed)} {topItem.unit} consumidos ·
                  Custo: {fmtCurrency(topItem.totalAllocatedCostConsumed)}
                </p>
              </div>
            ) : null}

            <div className="grid gap-2">
              <p className="text-sm font-bold text-[hsl(var(--brand-dark))]">Consumo por insumo</p>
              {report.items.length === 0 ? (
                <p className="text-sm text-[hsl(var(--foreground-muted))]">
                  Nenhum consumo encontrado no período selecionado.
                </p>
              ) : (
                report.items.map((item) => {
                  const pct =
                    totalQty > 0 ? (item.totalAllocatedQuantityConsumed / totalQty) * 100 : 0;
                  return (
                    <div
                      key={item.productId ?? item.productCode}
                      className="rounded-[var(--radius-md)] border p-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-sm font-semibold">
                          {item.productCode} - {item.productName}
                        </span>
                        <span className="text-sm font-bold">
                          {fmtNumber(item.totalAllocatedQuantityConsumed)} {item.unit} ·{" "}
                          {fmtCurrency(item.totalAllocatedCostConsumed)}
                        </span>
                      </div>
                      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[hsl(var(--surface-muted))]">
                        <div
                          className="brand-gradient h-full"
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                      <p className="mt-1 text-xs text-[hsl(var(--foreground-muted))]">
                        Participação no consumo: {pct.toFixed(0)}%
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
