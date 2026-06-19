import { api } from "@/shared/lib/http/api-client";
import type { DownloadInventoryMovementsCsvQuery } from "./contracts/reports.dto";

function parseFilename(contentDisposition?: string): string {
  if (!contentDisposition) return `inventory-movements-${Date.now()}.csv`;

  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) return decodeURIComponent(utf8Match[1]);

  const standardMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
  if (standardMatch?.[1]) return standardMatch[1];

  return `inventory-movements-${Date.now()}.csv`;
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

    const fileName = parseFilename(response.headers["content-disposition"] as string | undefined);
    const blobUrl = window.URL.createObjectURL(response.data);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(blobUrl);
  },
};
