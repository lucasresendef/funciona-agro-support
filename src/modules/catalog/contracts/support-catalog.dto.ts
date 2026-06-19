import type { ISODateString, PaginatedResponse } from "@/shared/types/common";

export interface SupportCatalogUnitDto {
  id: string;
  name: string;
  symbol: string;
  active: boolean;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface SupportCatalogProductDto {
  id: string;
  name: string;
  code: string;
  category: string;
  description: string | null;
  activeIngredient: string | null;
  unitOfMeasureId: string;
  active: boolean;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  unitOfMeasure: SupportCatalogUnitDto;
}

export interface SupportCatalogListQueryDto {
  search?: string;
  active?: boolean;
  page: number;
  limit: number;
}

export interface SupportCatalogProductListQueryDto extends SupportCatalogListQueryDto {
  category?: string;
}

export interface CreateSupportCatalogUnitRequestDto {
  name: string;
  symbol: string;
}

export interface UpdateSupportCatalogUnitRequestDto {
  name?: string;
  symbol?: string;
  active?: boolean;
}

export interface CreateSupportCatalogProductRequestDto {
  name: string;
  code: string;
  category: string;
  description?: string;
  activeIngredient?: string;
  unitOfMeasureId: string;
}

export interface UpdateSupportCatalogProductRequestDto {
  name?: string;
  code?: string;
  category?: string;
  description?: string | null;
  activeIngredient?: string | null;
  unitOfMeasureId?: string;
  active?: boolean;
}

export type SupportCatalogUnitsResponseDto = PaginatedResponse<SupportCatalogUnitDto>;
export type SupportCatalogProductsResponseDto = PaginatedResponse<SupportCatalogProductDto>;
