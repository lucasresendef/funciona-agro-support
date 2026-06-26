import type {
  DecimalLike,
  FieldOperationEntity,
  FieldOperationStatus,
  OperationItem,
} from "./operations.types";

export function num(value: DecimalLike): number {
  if (value === null || value === undefined) return 0;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatNumber(value: DecimalLike): string {
  return num(value).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatCurrency(value: DecimalLike): string {
  return num(value).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "-";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function parseDecimalInput(value: string): number | null {
  const normalized = value.trim().replace(",", ".");
  if (normalized === "") return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

export function computeConsumed(quantitySent: number, quantityReturned: number): number {
  const consumed = quantitySent - quantityReturned;
  if (consumed < 0) return 0;
  if (consumed > quantitySent) return quantitySent;
  return consumed;
}

export function itemConsumed(item: OperationItem): number {
  if (item.quantityConsumed !== null && item.quantityConsumed !== undefined) {
    return num(item.quantityConsumed);
  }
  return num(item.quantitySent);
}

export function itemLineTotal(item: OperationItem): number {
  const base =
    item.totalCostConsumed !== null && item.totalCostConsumed !== undefined
      ? num(item.totalCostConsumed)
      : itemConsumed(item);
  return base * num(item.unitCostAtOperation);
}

export function unitSymbol(item: OperationItem): string {
  return item.product?.unitOfMeasure?.symbol ?? "un.";
}

export function operationLabel(operation: FieldOperationEntity): string {
  return operation.sequenceNumber ? `Operação #${operation.sequenceNumber}` : "Operação";
}

export const STATUS_LABEL: Record<FieldOperationStatus, string> = {
  OPEN: "Aberta",
  FINISHED: "Finalizada",
  CANCELED: "Cancelada",
};

export const STATUS_BADGE_CLASS: Record<FieldOperationStatus, string> = {
  OPEN: "bg-amber-100 text-amber-800",
  FINISHED: "bg-emerald-100 text-emerald-800",
  CANCELED: "bg-rose-100 text-rose-800",
};

export function fieldNames(operation: FieldOperationEntity): string[] {
  return (operation.fields ?? []).map((link) => link.field?.name ?? link.fieldId);
}

export function matchesSearch(operation: FieldOperationEntity, term: string): boolean {
  const haystack = [
    operationLabel(operation),
    operation.sequenceNumber ? String(operation.sequenceNumber) : "",
    operation.status,
    operation.description ?? "",
    fieldNames(operation).join(" "),
    (operation.items ?? []).map((item) => item.product?.name ?? "").join(" "),
    (operation.items ?? []).map((item) => item.product?.code ?? "").join(" "),
    operation.inventoryLocation?.name ?? "",
    operation.farm?.name ?? "",
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(term.trim().toLowerCase());
}
