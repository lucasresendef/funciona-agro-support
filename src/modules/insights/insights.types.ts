import type { ISODateString } from "@/shared/types/common";

export interface FieldReportItem {
  productId?: string;
  productCode: string;
  productName: string;
  unit: string;
  totalAllocatedQuantityConsumed: number;
  totalAllocatedCostConsumed: number;
}

export interface FieldConsumptionReport {
  fieldId: string;
  fieldName: string;
  farmId?: string;
  farmName: string;
  period: { from: ISODateString; to: ISODateString };
  summary: {
    totalAllocatedQuantityConsumed: number;
    totalAllocatedCostConsumed: number;
    operationCount: number;
    itemCount: number;
  };
  items: FieldReportItem[];
}

export interface DashboardMostUsedProduct {
  productCode: string;
  productName: string;
  unit: string;
  totalQuantityConsumed: number;
  totalCostConsumed: number;
  operationItemCount: number;
}

export interface DashboardLowestStockProduct {
  productCode: string;
  productName: string;
  unit: string;
  estimatedStockQuantity: number;
  calculatedUntil: ISODateString | null;
}

export interface DashboardFieldConsumptionEntry {
  fieldName: string;
  farmName: string;
  totalAllocatedQuantityConsumed: number;
  totalAllocatedCostConsumed: number;
}

export interface DashboardMetrics {
  period: { from: ISODateString; to: ISODateString };
  filters: { farmId: string | null };
  operations: {
    totalFinishedOperations: number;
    totalQuantityConsumed: number;
    totalCostConsumed: number;
  };
  mostUsedProduct: DashboardMostUsedProduct | null;
  lowestStockProduct: DashboardLowestStockProduct | null;
  fieldConsumption: {
    highest: DashboardFieldConsumptionEntry | null;
    lowest: DashboardFieldConsumptionEntry | null;
  };
}
