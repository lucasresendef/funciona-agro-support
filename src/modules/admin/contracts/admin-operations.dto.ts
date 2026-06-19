import type { FarmEntity, FarmPermissionEntity, FarmUserRole, FieldEntity } from "@/shared/types/auth";
import type { ISODateString, PaginatedResponse, UUID } from "@/shared/types/common";

export interface UnitEntity {
  id: UUID;
  name: string;
  symbol: string;
  active: boolean;
  createdAt?: ISODateString;
  updatedAt?: ISODateString;
}

export interface ProductStockLocationEntity {
  farmId: UUID;
  farmName: string;
  inventoryLocationId: UUID;
  inventoryLocationName: string;
  quantity: number;
  averageUnitCost: number;
}

export interface ProductEntity {
  id: UUID;
  name: string;
  code: string;
  category: string;
  description: string | null;
  activeIngredient: string | null;
  unitOfMeasureId: UUID;
  active: boolean;
  createdAt?: ISODateString;
  updatedAt?: ISODateString;
  unitOfMeasure: UnitEntity;
  stockByLocation: ProductStockLocationEntity[];
  totalStockQuantity: number;
}

export interface InventoryLocationEntity {
  id: UUID;
  farmId: UUID;
  name: string;
  description: string | null;
  active: boolean;
  createdAt?: ISODateString;
  updatedAt?: ISODateString;
  farm: FarmEntity;
}

export interface InventoryBalanceEntity {
  id: UUID;
  farmId: UUID;
  inventoryLocationId: UUID;
  productId: UUID;
  quantity: number | string;
  averageUnitCost: number | string;
  active: boolean;
  createdAt?: ISODateString;
  updatedAt?: ISODateString;
  farm: FarmEntity;
  inventoryLocation: InventoryLocationEntity;
  product: ProductEntity;
}

export interface FarmPermissionListEntity extends FarmPermissionEntity {
  userName: string;
  userEmail: string;
  farm: FarmEntity;
}

export interface AppListQueryDto {
  page: number;
  limit: number;
  search?: string;
  active?: boolean;
}

export interface FieldsListQueryDto extends AppListQueryDto {
  farmId?: UUID;
}

export interface PermissionsListQueryDto extends AppListQueryDto {
  farmId?: UUID;
  keycloakUserId?: string;
  role?: FarmUserRole;
}

export interface ProductsListQueryDto extends AppListQueryDto {
  farmId?: UUID;
  category?: string;
}

export interface InventoryLocationsListQueryDto extends AppListQueryDto {
  farmId?: UUID;
}

export interface InventoryBalancesListQueryDto extends AppListQueryDto {
  farmId?: UUID;
  inventoryLocationId?: UUID;
  productId?: UUID;
}

export interface CreateFarmRequestDto {
  name: string;
  description?: string;
}

export interface UpdateFarmRequestDto {
  name?: string;
  description?: string | null;
}

export interface CreateFieldRequestDto {
  farmId: UUID;
  name: string;
  areaHectares: number;
  description?: string;
}

export interface UpdateFieldRequestDto {
  name?: string;
  areaHectares?: number;
  description?: string | null;
}

export interface CreatePermissionRequestDto {
  farmId: UUID;
  userId: UUID;
  role: FarmUserRole;
}

export interface UpdatePermissionRequestDto {
  role?: FarmUserRole;
  active?: boolean;
}

export interface CreateUnitRequestDto {
  name: string;
  symbol: string;
}

export interface UpdateUnitRequestDto {
  name?: string;
  symbol?: string;
}

export interface CreateProductRequestDto {
  name: string;
  code: string;
  category: string;
  description?: string;
  activeIngredient?: string;
  unitOfMeasureId: UUID;
  stockByLocation: Array<{
    farmId: UUID;
    inventoryLocationId: UUID;
    quantity: number;
    averageUnitCost: number;
    notes?: string | null;
  }>;
}

export interface UpdateProductRequestDto {
  name?: string;
  code?: string;
  category?: string;
  description?: string | null;
  activeIngredient?: string | null;
  unitOfMeasureId?: UUID;
}

export interface CreateInventoryLocationRequestDto {
  farmId: UUID;
  name: string;
  description?: string;
}

export interface UpdateInventoryLocationRequestDto {
  name?: string;
  description?: string | null;
}

export interface CreateInventoryBalanceRequestDto {
  farmId: UUID;
  inventoryLocationId: UUID;
  productId: UUID;
  quantity: number;
  averageUnitCost: number;
  occurredAt?: string;
  notes?: string;
}

export interface UpdateInventoryBalanceRequestDto {
  quantity?: number;
  averageUnitCost?: number;
  occurredAt?: string;
  notes?: string | null;
}

export type FarmsResponseDto = PaginatedResponse<FarmEntity>;
export type FieldsResponseDto = PaginatedResponse<FieldEntity>;
export type PermissionsResponseDto = PaginatedResponse<FarmPermissionListEntity>;
export type UnitsResponseDto = PaginatedResponse<UnitEntity>;
export type ProductsResponseDto = PaginatedResponse<ProductEntity>;
export type InventoryLocationsResponseDto = PaginatedResponse<InventoryLocationEntity>;
export type InventoryBalancesResponseDto = PaginatedResponse<InventoryBalanceEntity>;
