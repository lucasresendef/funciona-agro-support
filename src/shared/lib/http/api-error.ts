import type { ApiErrorPayload } from "@/shared/types/api";

export class ApiError extends Error {
  statusCode: number;
  details?: unknown;

  constructor(payload: ApiErrorPayload) {
    super(payload.message);
    this.statusCode = payload.statusCode;
    this.details = payload.details;
  }
}
