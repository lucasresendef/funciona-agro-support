import { reportsApi } from "@/modules/reports/reports.api";
import type { InventoryMovementsCsvMode } from "@/modules/reports/contracts/reports.dto";
import { getApiErrorMessage, handleSecurityError } from "@/shared/lib/http/security";
import { AppButton } from "@/shared/ui/components/AppButton";
import { AppCard } from "@/shared/ui/components/AppCard";
import { PageHeader } from "@/shared/ui/components/PageHeader";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export function ReportsPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<InventoryMovementsCsvMode>("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [farmId, setFarmId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleDownload() {
    if ((mode === "current" || mode === "filtered") && (!from || !to || !farmId)) {
      toast.error("Para current/filtered, informe de/até/farmId");
      return;
    }

    setIsLoading(true);
    try {
      await reportsApi.downloadInventoryMovementsCsv({ mode, from, to, farmId });
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
        title="Relatórios CSV"
        subtitle="Exportação de movimentações de inventário"
        breadcrumb="Operações / Relatórios"
      />
      <AppCard className="space-y-3">
        <div className="grid gap-3 md:grid-cols-4">
          <select value={mode} onChange={(e) => setMode(e.target.value as InventoryMovementsCsvMode)} className="h-11 rounded-[var(--radius-md)] border bg-white px-3 text-sm">
            <option value="all">all</option>
            <option value="current">current</option>
            <option value="filtered">filtered</option>
          </select>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="h-11 rounded-[var(--radius-md)] border bg-white px-3 text-sm" />
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="h-11 rounded-[var(--radius-md)] border bg-white px-3 text-sm" />
          <input value={farmId} onChange={(e) => setFarmId(e.target.value)} placeholder="farmId" className="h-11 rounded-[var(--radius-md)] border bg-white px-3 text-sm" />
        </div>
        <AppButton type="button" onClick={handleDownload} disabled={isLoading}>
          {isLoading ? "Baixando..." : "Baixar CSV"}
        </AppButton>
      </AppCard>
    </div>
  );
}
