import { toPng } from "html-to-image";

export function fmtNumber(value: number | null | undefined): string {
  return (value ?? 0).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function fmtCurrency(value: number | null | undefined): string {
  return (value ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function fmtInt(value: number | null | undefined): string {
  return (value ?? 0).toLocaleString("pt-BR");
}

export function fmtDate(iso?: string | null): string {
  if (!iso) return "-";
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString("pt-BR");
}

export function fmtDateTime(iso?: string | null): string {
  if (!iso) return "-";
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? "-"
    : date.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
}

export function toDateInputValue(date: Date): string {
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 10);
}

export function startOfDayIso(dateInput: string): string {
  return new Date(`${dateInput}T00:00:00`).toISOString();
}

export function endOfDayIso(dateInput: string): string {
  return new Date(`${dateInput}T23:59:59`).toISOString();
}

function safeFileName(name: string): string {
  const normalized = name
    .replace(/[^a-zA-Z0-9-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
  return normalized || "relatorio";
}

async function captureToPng(node: HTMLElement): Promise<string> {
  return toPng(node, { pixelRatio: 2, backgroundColor: "#ffffff", cacheBust: true });
}

export async function downloadNodeAsImage(node: HTMLElement, fileName: string): Promise<void> {
  const dataUrl = await captureToPng(node);
  const link = document.createElement("a");
  link.download = `${safeFileName(fileName)}.png`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export async function shareNodeAsImage(
  node: HTMLElement,
  fileName: string,
  text: string,
): Promise<"shared" | "downloaded"> {
  const dataUrl = await captureToPng(node);
  const blob = await (await fetch(dataUrl)).blob();
  const file = new File([blob], `${safeFileName(fileName)}.png`, { type: "image/png" });

  const nav = navigator as Navigator & {
    canShare?: (data: ShareData) => boolean;
  };

  if (nav.share && nav.canShare?.({ files: [file] })) {
    await nav.share({ files: [file], text });
    return "shared";
  }

  const link = document.createElement("a");
  link.download = file.name;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  link.remove();
  return "downloaded";
}
