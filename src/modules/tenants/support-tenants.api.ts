import { api } from "@/shared/lib/http/api-client";
import type { DataWrapper } from "@/shared/types/api";
import type { PaginatedResponse } from "@/shared/types/common";
import type {
  CreateTenantResponseDto,
  CreateTenantPermissionRequestDto,
  CreateTenantFarmRequestDto,
  CreateTenantFieldRequestDto,
  CreateTenantRequestDto,
  CreateTenantUserRequestDto,
  ListTenantsQueryDto,
  ResetTenantUserPasswordRequestDto,
  TenantDetailDto,
  TenantListItemDto,
  UpdateTenantFarmRequestDto,
  UpdateTenantFieldRequestDto,
  UpdateTenantPermissionRequestDto,
  UpdateTenantRequestDto,
  UpdateTenantUserRequestDto,
} from "./contracts/support-tenants.dto";

interface BackendPaginatedTenantsResponse {
  data: TenantListItemDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

function toPaginatedTenants(
  payload: BackendPaginatedTenantsResponse,
): PaginatedResponse<TenantListItemDto> {
  return {
    data: payload.data,
    page: payload.pagination.page,
    limit: payload.pagination.limit,
    total: payload.pagination.total,
    totalPages: payload.pagination.totalPages,
  };
}

export const supportTenantsApi = {
  async listTenants(query: ListTenantsQueryDto): Promise<PaginatedResponse<TenantListItemDto>> {
    const res = await api.get<BackendPaginatedTenantsResponse>("/support/tenants", {
      params: {
        search: query.search || undefined,
        active: typeof query.active === "boolean" ? query.active : undefined,
        page: query.page,
        limit: query.limit,
      },
    });
    return toPaginatedTenants(res.data);
  },

  async getTenant(tenantId: string): Promise<TenantDetailDto> {
    const res = await api.get<DataWrapper<TenantDetailDto>>(`/support/tenants/${tenantId}`);
    return res.data.data;
  },

  async createTenant(payload: CreateTenantRequestDto): Promise<CreateTenantResponseDto> {
    const res = await api.post<DataWrapper<{ tenant: { id: string } }>>(
      "/support/tenants",
      payload,
    );
    return {
      id: res.data.data.tenant.id,
    };
  },

  async updateTenant(tenantId: string, payload: UpdateTenantRequestDto): Promise<void> {
    await api.patch(`/support/tenants/${tenantId}`, payload);
  },

  async deactivateTenant(tenantId: string): Promise<void> {
    await api.delete(`/support/tenants/${tenantId}`);
  },

  async createTenantUser(tenantId: string, payload: CreateTenantUserRequestDto): Promise<void> {
    await api.post(`/support/tenants/${tenantId}/users`, payload);
  },

  async updateTenantUser(
    tenantId: string,
    userId: string,
    payload: UpdateTenantUserRequestDto,
  ): Promise<void> {
    await api.patch(`/support/tenants/${tenantId}/users/${userId}`, payload);
  },

  async resetTenantUserPassword(
    tenantId: string,
    userId: string,
    payload: ResetTenantUserPasswordRequestDto,
  ): Promise<void> {
    await api.post(`/support/tenants/${tenantId}/users/${userId}/reset-password`, payload);
  },

  async deactivateTenantUser(tenantId: string, userId: string): Promise<void> {
    await api.delete(`/support/tenants/${tenantId}/users/${userId}`);
  },

  async createTenantFarm(tenantId: string, payload: CreateTenantFarmRequestDto): Promise<void> {
    await api.post(`/support/tenants/${tenantId}/farms`, payload);
  },

  async updateTenantFarm(
    tenantId: string,
    farmId: string,
    payload: UpdateTenantFarmRequestDto,
  ): Promise<void> {
    await api.patch(`/support/tenants/${tenantId}/farms/${farmId}`, payload);
  },

  async deactivateTenantFarm(tenantId: string, farmId: string): Promise<void> {
    await api.delete(`/support/tenants/${tenantId}/farms/${farmId}`);
  },

  async createTenantField(tenantId: string, payload: CreateTenantFieldRequestDto): Promise<void> {
    await api.post(`/support/tenants/${tenantId}/fields`, payload);
  },

  async updateTenantField(
    tenantId: string,
    fieldId: string,
    payload: UpdateTenantFieldRequestDto,
  ): Promise<void> {
    await api.patch(`/support/tenants/${tenantId}/fields/${fieldId}`, payload);
  },

  async deactivateTenantField(tenantId: string, fieldId: string): Promise<void> {
    await api.delete(`/support/tenants/${tenantId}/fields/${fieldId}`);
  },

  async createTenantPermission(
    tenantId: string,
    payload: CreateTenantPermissionRequestDto,
  ): Promise<void> {
    await api.post(`/support/tenants/${tenantId}/permissions`, payload);
  },

  async updateTenantPermission(
    tenantId: string,
    permissionId: string,
    payload: UpdateTenantPermissionRequestDto,
  ): Promise<void> {
    await api.patch(`/support/tenants/${tenantId}/permissions/${permissionId}`, payload);
  },

  async deactivateTenantPermission(tenantId: string, permissionId: string): Promise<void> {
    await api.delete(`/support/tenants/${tenantId}/permissions/${permissionId}`);
  },
};
