export type UUID = string;
export type ISODateString = string;
export type EntityStatus = "active" | "inactive";

export interface PaginationQuery {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
