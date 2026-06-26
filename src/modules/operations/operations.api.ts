import { api } from "@/shared/lib/http/api-client";
import {
  type BackendPaginatedResponse,
  type DataWrapper,
  toAppPaginated,
} from "@/shared/types/api";
import type {
  CreateFieldOperationDto,
  FieldOperationEntity,
  FieldOperationsListQueryDto,
  FieldOperationsResponseDto,
  UpdateFieldOperationDto,
} from "./operations.types";

export const operationsApi = {
  async list(query: FieldOperationsListQueryDto): Promise<FieldOperationsResponseDto> {
    const res = await api.get<BackendPaginatedResponse<FieldOperationEntity>>("/field-operations", {
      params: {
        page: query.page,
        limit: query.limit,
        farmId: query.farmId || undefined,
        fieldId: query.fieldId || undefined,
        status: query.status || undefined,
        active: typeof query.active === "boolean" ? query.active : undefined,
      },
    });
    return toAppPaginated(res.data);
  },

  async create(payload: CreateFieldOperationDto): Promise<FieldOperationEntity> {
    const res = await api.post<DataWrapper<FieldOperationEntity>>("/field-operations", payload);
    return res.data.data;
  },

  async update(id: string, payload: UpdateFieldOperationDto): Promise<FieldOperationEntity> {
    const res = await api.patch<DataWrapper<FieldOperationEntity>>(
      `/field-operations/${id}`,
      payload,
    );
    return res.data.data;
  },

  async deactivate(id: string): Promise<void> {
    await api.delete(`/field-operations/${id}`);
  },
};
