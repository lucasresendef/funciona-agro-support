import { api } from "@/shared/lib/http/api-client";
import {
  type BackendPaginatedResponse,
  type DataWrapper,
  toAppPaginated,
} from "@/shared/types/api";
import type { AppUserEntity, FarmEntity, FieldEntity } from "@/shared/types/auth";
import type {
  AppListQueryDto,
  CreateFarmRequestDto,
  CreateFieldRequestDto,
  CreateInventoryBalanceRequestDto,
  CreateInventoryLocationRequestDto,
  CreatePermissionRequestDto,
  CreateProductRequestDto,
  CreateUnitRequestDto,
  FarmsResponseDto,
  FieldsListQueryDto,
  FieldsResponseDto,
  InventoryBalanceEntity,
  InventoryBalancesListQueryDto,
  InventoryBalancesResponseDto,
  InventoryLocationEntity,
  InventoryLocationsListQueryDto,
  InventoryLocationsResponseDto,
  PermissionsListQueryDto,
  PermissionsResponseDto,
  FarmPermissionListEntity,
  ProductEntity,
  ProductsListQueryDto,
  ProductsResponseDto,
  UnitEntity,
  UnitsResponseDto,
  UpdateFarmRequestDto,
  UpdateFieldRequestDto,
  UpdateInventoryBalanceRequestDto,
  UpdateInventoryLocationRequestDto,
  UpdatePermissionRequestDto,
  UpdateProductRequestDto,
  UpdateUnitRequestDto,
} from "./contracts/admin-operations.dto";

export const adminOperationsApi = {
  async listUsers(): Promise<AppUserEntity[]> {
    const res = await api.get<BackendPaginatedResponse<AppUserEntity>>("/users", {
      params: { page: 1, limit: 100, active: true },
    });
    return res.data.data;
  },

  async listFarms(query: AppListQueryDto): Promise<FarmsResponseDto> {
    const res = await api.get<BackendPaginatedResponse<FarmEntity>>("/farms", {
      params: {
        page: query.page,
        limit: query.limit,
        search: query.search || undefined,
        active: typeof query.active === "boolean" ? query.active : undefined,
      },
    });
    return toAppPaginated(res.data);
  },

  async createFarm(payload: CreateFarmRequestDto): Promise<FarmEntity> {
    const res = await api.post<DataWrapper<FarmEntity>>("/farms", payload);
    return res.data.data;
  },

  async updateFarm(farmId: string, payload: UpdateFarmRequestDto): Promise<FarmEntity> {
    const res = await api.patch<DataWrapper<FarmEntity>>(`/farms/${farmId}`, payload);
    return res.data.data;
  },

  async deactivateFarm(farmId: string): Promise<void> {
    await api.delete(`/farms/${farmId}`);
  },

  async listFields(query: FieldsListQueryDto): Promise<FieldsResponseDto> {
    const res = await api.get<BackendPaginatedResponse<FieldEntity>>("/fields", {
      params: {
        page: query.page,
        limit: query.limit,
        search: query.search || undefined,
        farmId: query.farmId || undefined,
        active: typeof query.active === "boolean" ? query.active : undefined,
      },
    });
    return toAppPaginated(res.data);
  },

  async createField(payload: CreateFieldRequestDto): Promise<FieldEntity> {
    const res = await api.post<DataWrapper<FieldEntity>>("/fields", payload);
    return res.data.data;
  },

  async updateField(fieldId: string, payload: UpdateFieldRequestDto): Promise<FieldEntity> {
    const res = await api.patch<DataWrapper<FieldEntity>>(`/fields/${fieldId}`, payload);
    return res.data.data;
  },

  async deactivateField(fieldId: string): Promise<void> {
    await api.delete(`/fields/${fieldId}`);
  },

  async listPermissions(query: PermissionsListQueryDto): Promise<PermissionsResponseDto> {
    const res = await api.get<BackendPaginatedResponse<FarmPermissionListEntity>>(
      "/farm-permissions",
      {
        params: {
          page: query.page,
          limit: query.limit,
          farmId: query.farmId || undefined,
          keycloakUserId: query.keycloakUserId || undefined,
          role: query.role || undefined,
          active: typeof query.active === "boolean" ? query.active : undefined,
        },
      },
    );
    return toAppPaginated(res.data);
  },

  async createPermission(payload: CreatePermissionRequestDto): Promise<FarmPermissionListEntity> {
    const res = await api.post<DataWrapper<FarmPermissionListEntity>>("/farm-permissions", payload);
    return res.data.data;
  },

  async updatePermission(
    permissionId: string,
    payload: UpdatePermissionRequestDto,
  ): Promise<FarmPermissionListEntity> {
    const res = await api.patch<DataWrapper<FarmPermissionListEntity>>(
      `/farm-permissions/${permissionId}`,
      payload,
    );
    return res.data.data;
  },

  async deactivatePermission(permissionId: string): Promise<void> {
    await api.delete(`/farm-permissions/${permissionId}`);
  },

  async listUnits(query: AppListQueryDto): Promise<UnitsResponseDto> {
    const res = await api.get<BackendPaginatedResponse<UnitEntity>>("/units", {
      params: {
        page: query.page,
        limit: query.limit,
        search: query.search || undefined,
        active: typeof query.active === "boolean" ? query.active : undefined,
      },
    });
    return toAppPaginated(res.data);
  },

  async createUnit(payload: CreateUnitRequestDto): Promise<UnitEntity> {
    const res = await api.post<DataWrapper<UnitEntity>>("/units", payload);
    return res.data.data;
  },

  async updateUnit(unitId: string, payload: UpdateUnitRequestDto): Promise<UnitEntity> {
    const res = await api.patch<DataWrapper<UnitEntity>>(`/units/${unitId}`, payload);
    return res.data.data;
  },

  async deactivateUnit(unitId: string): Promise<void> {
    await api.delete(`/units/${unitId}`);
  },

  async listProducts(query: ProductsListQueryDto): Promise<ProductsResponseDto> {
    const res = await api.get<BackendPaginatedResponse<ProductEntity>>("/products", {
      params: {
        page: query.page,
        limit: query.limit,
        search: query.search || undefined,
        farmId: query.farmId || undefined,
        category: query.category || undefined,
        active: typeof query.active === "boolean" ? query.active : undefined,
      },
    });
    return toAppPaginated(res.data);
  },

  async createProduct(payload: CreateProductRequestDto): Promise<ProductEntity> {
    const res = await api.post<DataWrapper<ProductEntity>>("/products", payload);
    return res.data.data;
  },

  async updateProduct(
    productId: string,
    payload: UpdateProductRequestDto,
  ): Promise<ProductEntity> {
    const res = await api.patch<DataWrapper<ProductEntity>>(`/products/${productId}`, payload);
    return res.data.data;
  },

  async deactivateProduct(productId: string): Promise<void> {
    await api.delete(`/products/${productId}`);
  },

  async listInventoryLocations(
    query: InventoryLocationsListQueryDto,
  ): Promise<InventoryLocationsResponseDto> {
    const res = await api.get<BackendPaginatedResponse<InventoryLocationEntity>>(
      "/inventory/locations",
      {
        params: {
          page: query.page,
          limit: query.limit,
          search: query.search || undefined,
          farmId: query.farmId || undefined,
          active: typeof query.active === "boolean" ? query.active : undefined,
        },
      },
    );
    return toAppPaginated(res.data);
  },

  async createInventoryLocation(
    payload: CreateInventoryLocationRequestDto,
  ): Promise<InventoryLocationEntity> {
    const res = await api.post<DataWrapper<InventoryLocationEntity>>(
      "/inventory/locations",
      payload,
    );
    return res.data.data;
  },

  async updateInventoryLocation(
    locationId: string,
    payload: UpdateInventoryLocationRequestDto,
  ): Promise<InventoryLocationEntity> {
    const res = await api.patch<DataWrapper<InventoryLocationEntity>>(
      `/inventory/locations/${locationId}`,
      payload,
    );
    return res.data.data;
  },

  async deactivateInventoryLocation(locationId: string): Promise<void> {
    await api.delete(`/inventory/locations/${locationId}`);
  },

  async listInventoryBalances(
    query: InventoryBalancesListQueryDto,
  ): Promise<InventoryBalancesResponseDto> {
    const res = await api.get<BackendPaginatedResponse<InventoryBalanceEntity>>(
      "/inventory/balance",
      {
        params: {
          page: query.page,
          limit: query.limit,
          farmId: query.farmId || undefined,
          inventoryLocationId: query.inventoryLocationId || undefined,
          productId: query.productId || undefined,
          active: typeof query.active === "boolean" ? query.active : undefined,
        },
      },
    );
    return toAppPaginated(res.data);
  },

  async createInventoryBalance(
    payload: CreateInventoryBalanceRequestDto,
  ): Promise<InventoryBalanceEntity> {
    const res = await api.post<DataWrapper<InventoryBalanceEntity>>(
      "/inventory/balance",
      payload,
    );
    return res.data.data;
  },

  async updateInventoryBalance(
    balanceId: string,
    payload: UpdateInventoryBalanceRequestDto,
  ): Promise<InventoryBalanceEntity> {
    const res = await api.patch<DataWrapper<InventoryBalanceEntity>>(
      `/inventory/balance/${balanceId}`,
      payload,
    );
    return res.data.data;
  },

  async deactivateInventoryBalance(balanceId: string): Promise<void> {
    await api.delete(`/inventory/balance/${balanceId}`);
  },
};
