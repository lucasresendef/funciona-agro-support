import type { PaginatedResponse } from "./common";

export interface ApiErrorPayload {
  statusCode: number;
  message: string;
  code?: string;
  details?: unknown;
}

export interface BackendPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface BackendPaginatedResponse<T> {
  data: T[];
  pagination: BackendPaginationMeta;
}

export interface DataWrapper<T> {
  data: T;
}

export function toAppPaginated<T>(payload: BackendPaginatedResponse<T>): PaginatedResponse<T> {
  return {
    data: payload.data,
    page: payload.pagination.page,
    limit: payload.pagination.limit,
    total: payload.pagination.total,
    totalPages: payload.pagination.totalPages,
  };
}
