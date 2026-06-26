import { adminOperationsApi } from "@/modules/admin/admin-operations.api";
import { reportsApi } from "@/modules/reports/reports.api";
import { queryKeys } from "@/shared/config/query-keys";
import { getApiErrorMessage, handleSecurityError } from "@/shared/lib/http/security";
import { AppButton } from "@/shared/ui/components/AppButton";
import { AppCard } from "@/shared/ui/components/AppCard";
import { AppSelect } from "@/shared/ui/components/AppSelect";
import { DateRangePicker } from "@/shared/ui/components/DateRangePicker";
import { PageHeader } from "@/shared/ui/components/PageHeader";
import { useQuery } from "@tanstack/react-query";
import { Download } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const labelClassName = "text-xs font-semibold text-[hsl(var(--foreground-muted))]";

const STATUS_OPTIONS = [
  { value: "", label: "Todas as situações" },
  { value: "OPEN", label: "Abertas" },
  { value: "FINISHED", label: "Finalizadas" },
  { value: "CANCELED", label: "Canceladas" },
];

function toDateInputValue(date: Date): string {
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 10);
}

function defaultFrom(): string {
  const date = new Date();
  date.setDate(date.getDate() - 30);
  return toDateInputValue(date);
}

export function ReportsPage() {
  const navigate = useNavigate();
  const [farmId, setFarmId] = useState("");
  const [status, setStatus] = useState("");
  const [from, setFrom] = useState(defaultFrom());
  const [to, setTo] = useState(toDateInputValue(new Date()));
  const [isLoading, setIsLoading] = useState(false);

  const farmsQuery = useQuery({
    queryKey: [...queryKeys.farms, "report-csv"],
    queryFn: () => adminOperationsApi.listFarms({ page: 1, limit: 100, active: true }),
  });
  const farms = farmsQuery.data?.data ?? [];

  async function handleDownload() {
    if (from && to && from > to) {
      toast.error("A data inicial deve ser menor que a final.");
      return;
    }

    setIsLoading(true);
    try {
      await reportsApi.downloadFieldOperationsCsv({
        farmId: farmId || undefined,
        status: status || undefined,
        from: from ? new Date(`${from}T00:00:00`).toISOString() : undefined,
        to: to ? new Date(`${to}T23:59:59`).toISOString() : undefined,
      });
      toast.success("Download iniciado");
    } catch (error) {
      if (!handleSecurityError(error, navigate)) {
        toast.error(getApiErrorMessage(error, "Falha ao baixar CSV"));
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Relatório de operações (CSV)"
        subtitle="Exporte as operações com fazenda, talhões, produtos, local de estoque, unidades, quantidades e custos"
        breadcrumb="Operações / Relatórios"
      />
      <AppCard className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="grid gap-1">
            <span className={labelClassName}>Fazenda</span>
            <AppSelect
              value={farmId}
              onValueChange={setFarmId}
              ariaLabel="Fazenda"
              options={[
                { value: "", label: "Todas as fazendas" },
                ...farms.map((farm) => ({ value: farm.id, label: farm.name })),
              ]}
            />
          </div>
          <div className="grid gap-1">
            <span className={labelClassName}>Situação</span>
            <AppSelect
              value={status}
              onValueChange={setStatus}
              ariaLabel="Situação"
              options={STATUS_OPTIONS}
            />
          </div>
          <div className="grid gap-1">
            <span className={labelClassName}>Período</span>
            <DateRangePicker
              value={{ from, to }}
              onChange={(range) => {
                setFrom(range.from);
                setTo(range.to);
              }}
            />
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-[hsl(var(--foreground-muted))]">
            O arquivo traz uma linha por item de operação (produto), com todos os dados
            relacionados.
          </p>
          <AppButton type="button" onClick={handleDownload} disabled={isLoading}>
            <Download size={16} />
            <span className="ml-1">{isLoading ? "Baixando..." : "Baixar CSV"}</span>
          </AppButton>
        </div>
      </AppCard>
    </div>
  );
}
