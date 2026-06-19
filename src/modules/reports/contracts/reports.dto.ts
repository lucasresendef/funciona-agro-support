export type InventoryMovementsCsvMode = "current" | "filtered" | "all";

export interface DownloadInventoryMovementsCsvQuery {
  mode: InventoryMovementsCsvMode;
  from?: string;
  to?: string;
  farmId?: string;
}
