import { PAGE_SIZE_OPTIONS } from "@/shared/lib/hooks/usePaginationState";
import { cn } from "@/shared/lib/utils/cn";
import { AppSelect } from "@/shared/ui/components/AppSelect";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationControlsProps {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  className?: string;
}

const navButtonClass =
  "inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] text-[hsl(var(--foreground-muted))] transition hover:bg-[hsl(var(--surface-muted))] hover:text-[hsl(var(--brand-dark))] disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent";

export function PaginationControls({
  page,
  limit,
  total,
  totalPages,
  onPageChange,
  onLimitChange,
  className,
}: PaginationControlsProps) {
  const hasResults = total > 0;
  const startItem = hasResults ? (page - 1) * limit + 1 : 0;
  const endItem = hasResults ? Math.min(page * limit, total) : 0;
  const canGoBack = page > 1;
  const canGoNext = totalPages > 0 && page < totalPages;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 px-1 text-xs text-[hsl(var(--foreground-muted))]",
        className,
      )}
    >
      <span>{hasResults ? `${startItem}–${endItem} de ${total}` : "Sem registros"}</span>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <AppSelect
            value={String(limit)}
            onValueChange={(value) => onLimitChange(Number(value))}
            options={PAGE_SIZE_OPTIONS.map((option) => ({
              value: String(option),
              label: String(option),
            }))}
            className="h-8 w-auto"
            ariaLabel="Itens por página"
          />
          <span className="hidden sm:inline">por página</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Página anterior"
            className={navButtonClass}
            disabled={!canGoBack}
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronLeft size={16} />
          </button>
          <span className="min-w-[2.75rem] text-center font-medium text-[hsl(var(--brand-dark))]">
            {totalPages > 0 ? page : 0}/{totalPages}
          </span>
          <button
            type="button"
            aria-label="Próxima página"
            className={navButtonClass}
            disabled={!canGoNext}
            onClick={() => onPageChange(page + 1)}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
