import { api } from "@/shared/lib/http/api-client";
import type { DownloadInventoryMovementsCsvQuery } from "./contracts/reports.dto";

function parseFilename(contentDisposition: string | undefined, fallback: string): string {
  if (!contentDisposition) return fallback;

  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) return decodeURIComponent(utf8Match[1]);

  const standardMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
  if (standardMatch?.[1]) return standardMatch[1];

  return fallback;
}

function triggerBlobDownload(data: Blob, fileName: string): void {
  const blobUrl = window.URL.createObjectURL(data);
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(blobUrl);
}

export interface DownloadFieldOperationsCsvQuery {
  farmId?: string;
  status?: string;
  from?: string;
  to?: string;
}

export const reportsApi = {
  async downloadInventoryMovementsCsv(query: DownloadInventoryMovementsCsvQuery): Promise<void> {
    const isAll = query.mode === "all";
    if (!isAll && (!query.from || !query.to || !query.farmId)) {
      throw new Error("Para mode=current|filtered, informe from, to e farmId");
    }

    const response = await api.get<Blob>("/reports/inventory-movements/csv", {
      params: {
        mode: query.mode,
        from: query.from,
        to: query.to,
        farmId: query.farmId,
      },
      responseType: "blob",
    });

    triggerBlobDownload(
      response.data,
      parseFilename(
        response.headers["content-disposition"] as string | undefined,
        `inventory-movements-${Date.now()}.csv`,
      ),
    );
  },

  async downloadFieldOperationsCsv(query: DownloadFieldOperationsCsvQuery): Promise<void> {
    const response = await api.get<Blob>("/reports/field-operations/csv", {
      params: {
        farmId: query.farmId || undefined,
        status: query.status || undefined,
        from: query.from || undefined,
        to: query.to || undefined,
      },
      responseType: "blob",
    });

    triggerBlobDownload(
      response.data,
      parseFilename(
        response.headers["content-disposition"] as string | undefined,
        `operacoes-${Date.now()}.csv`,
      ),
    );
  },
};
