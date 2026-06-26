import type { ISODateString, PaginatedResponse, UUID } from "@/shared/types/common";

export type FieldOperationStatus = "OPEN" | "FINISHED" | "CANCELED";

export type DecimalLike = number | string | null | undefined;

export interface OperationProductRef {
  id: UUID;
  name: string;
  code?: string | null;
  unitOfMeasure?: { symbol: string } | null;
}

export interface OperationItemFieldResult {
  id: UUID;
  fieldId: UUID;
  allocatedQuantityConsumed: DecimalLike;
  allocatedTotalCostConsumed: DecimalLike;
  field?: { id: UUID; name: string } | null;
}

export interface OperationItem {
  id: UUID;
  productId: UUID;
  quantitySent: DecimalLike;
  quantityReturned: DecimalLike;
  quantityConsumed: DecimalLike;
  unitCostAtOperation: DecimalLike;
  totalCostConsumed: DecimalLike;
  notes: string | null;
  product?: OperationProductRef | null;
  fieldResults?: OperationItemFieldResult[];
}

export interface OperationFieldLink {
  id: UUID;
  fieldId: UUID;
  areaHectaresSnapshot?: DecimalLike;
  field?: { id: UUID; name: string; areaHectares?: DecimalLike } | null;
}

export interface FieldOperationEntity {
  id: UUID;
  sequenceNumber: number | null;
  farmId: UUID;
  inventoryLocationId: UUID;
  operationDate: ISODateString;
  status: FieldOperationStatus;
  description: string | null;
  responsibleUserId: UUID | null;
  startedAt: ISODateString | null;
  finishedAt: ISODateString | null;
  active: boolean;
  createdAt?: ISODateString;
  updatedAt?: ISODateString;
  createdBy?: string | null;
  createdByEmail?: string | null;
  updatedBy?: string | null;
  updatedByEmail?: string | null;
  farm?: { id: UUID; name: string } | null;
  inventoryLocation?: { id: UUID; name: string } | null;
  fields?: OperationFieldLink[];
  items?: OperationItem[];
}

export interface CreateFieldOperationItemDto {
  productId: UUID;
  quantitySent: number;
  quantityReturned?: number;
  quantityConsumed?: number;
  unitCostAtOperation: number;
  notes?: string | null;
}

export interface CreateFieldOperationDto {
  farmId: UUID;
  fieldIds: UUID[];
  inventoryLocationId: UUID;
  operationDate: string;
  status?: FieldOperationStatus;
  description?: string | null;
  startedAt?: string;
  items: CreateFieldOperationItemDto[];
}

export interface UpdateFieldOperationItemDto {
  id: UUID;
  quantityReturned?: number;
  quantityConsumed?: number;
  notes?: string | null;
}

export interface UpdateFieldOperationDto {
  status?: FieldOperationStatus;
  startedAt?: string | null;
  finishedAt?: string | null;
  description?: string | null;
  items?: UpdateFieldOperationItemDto[];
}

export interface FieldOperationsListQueryDto {
  page: number;
  limit: number;
  farmId?: string;
  fieldId?: string;
  status?: FieldOperationStatus;
  active?: boolean;
}

export type FieldOperationsResponseDto = PaginatedResponse<FieldOperationEntity>;

export type StatusScope = "openAndFinished" | "open" | "finished" | "canceled";

export const STATUS_SCOPES: Record<StatusScope, FieldOperationStatus[]> = {
  openAndFinished: ["OPEN", "FINISHED"],
  open: ["OPEN"],
  finished: ["FINISHED"],
  canceled: ["CANCELED"],
};
