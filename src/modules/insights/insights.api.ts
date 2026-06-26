import { api } from "@/shared/lib/http/api-client";
import type { DashboardMetrics, FieldConsumptionReport } from "./insights.types";

export interface FieldConsumptionQuery {
  fieldId: string;
  from: string;
  to: string;
}

export interface DashboardMetricsQuery {
  from: string;
  to: string;
  farmId?: string;
}

function unwrap<T>(payload: unknown): T {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

export const insightsApi = {
  async getFieldConsumption(query: FieldConsumptionQuery): Promise<FieldConsumptionReport> {
    const res = await api.get("/reports/field-consumption", {
      params: { fieldId: query.fieldId, from: query.from, to: query.to },
    });
    return unwrap<FieldConsumptionReport>(res.data);
  },

  async getDashboardMetrics(query: DashboardMetricsQuery): Promise<DashboardMetrics> {
    const res = await api.get("/reports/dashboard-metrics", {
      params: { from: query.from, to: query.to, farmId: query.farmId || undefined },
    });
    return unwrap<DashboardMetrics>(res.data);
  },
};
