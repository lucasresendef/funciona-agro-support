import { api } from "@/shared/lib/http/api-client";
import {
  type BackendPaginatedResponse,
  type DataWrapper,
  toAppPaginated,
} from "@/shared/types/api";
import type {
  CreateSupportCatalogProductRequestDto,
  CreateSupportCatalogUnitRequestDto,
  SupportCatalogProductDto,
  SupportCatalogProductListQueryDto,
  SupportCatalogProductsResponseDto,
  SupportCatalogUnitDto,
  SupportCatalogListQueryDto,
  SupportCatalogUnitsResponseDto,
  UpdateSupportCatalogProductRequestDto,
  UpdateSupportCatalogUnitRequestDto,
} from "./contracts/support-catalog.dto";

export const supportCatalogApi = {
  async listUnits(query: SupportCatalogListQueryDto): Promise<SupportCatalogUnitsResponseDto> {
    const res = await api.get<BackendPaginatedResponse<SupportCatalogUnitDto>>(
      "/support/catalog/units",
      {
        params: {
          search: query.search || undefined,
          active: typeof query.active === "boolean" ? query.active : undefined,
          page: query.page,
          limit: query.limit,
        },
      },
    );
    return toAppPaginated(res.data);
  },

  async createUnit(payload: CreateSupportCatalogUnitRequestDto): Promise<SupportCatalogUnitDto> {
    const res = await api.post<DataWrapper<SupportCatalogUnitDto>>("/support/catalog/units", payload);
    return res.data.data;
  },

  async updateUnit(
    unitId: string,
    payload: UpdateSupportCatalogUnitRequestDto,
  ): Promise<SupportCatalogUnitDto> {
    const res = await api.patch<DataWrapper<SupportCatalogUnitDto>>(
      `/support/catalog/units/${unitId}`,
      payload,
    );
    return res.data.data;
  },

  async deactivateUnit(unitId: string): Promise<void> {
    await api.delete(`/support/catalog/units/${unitId}`);
  },

  async listProducts(
    query: SupportCatalogProductListQueryDto,
  ): Promise<SupportCatalogProductsResponseDto> {
    const res = await api.get<BackendPaginatedResponse<SupportCatalogProductDto>>(
      "/support/catalog/products",
      {
        params: {
          search: query.search || undefined,
          category: query.category || undefined,
          active: typeof query.active === "boolean" ? query.active : undefined,
          page: query.page,
          limit: query.limit,
        },
      },
    );
    return toAppPaginated(res.data);
  },

  async createProduct(
    payload: CreateSupportCatalogProductRequestDto,
  ): Promise<SupportCatalogProductDto> {
    const res = await api.post<DataWrapper<SupportCatalogProductDto>>(
      "/support/catalog/products",
      payload,
    );
    return res.data.data;
  },

  async updateProduct(
    productId: string,
    payload: UpdateSupportCatalogProductRequestDto,
  ): Promise<SupportCatalogProductDto> {
    const res = await api.patch<DataWrapper<SupportCatalogProductDto>>(
      `/support/catalog/products/${productId}`,
      payload,
    );
    return res.data.data;
  },

  async deactivateProduct(productId: string): Promise<void> {
    await api.delete(`/support/catalog/products/${productId}`);
  },
};
