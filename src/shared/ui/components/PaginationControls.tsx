import { AppButton } from "@/shared/ui/components/AppButton";
import { AppCard } from "@/shared/ui/components/AppCard";
import { cn } from "@/shared/lib/utils/cn";
import { PAGE_SIZE_OPTIONS } from "@/shared/lib/hooks/usePaginationState";

interface PaginationControlsProps {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  className?: string;
}

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
    <AppCard
      className={cn(
        "flex flex-col gap-4 border-dashed bg-[hsl(var(--surface-muted))]/40 p-4 lg:flex-row lg:items-center lg:justify-between",
        className,
      )}
    >
      <div className="space-y-1">
        <p className="text-sm font-semibold text-[hsl(var(--brand-dark))]">
          {hasResults ? `Mostrando ${startItem} a ${endItem} de ${total}` : "Sem registros"}
        </p>
        <p className="text-xs text-[hsl(var(--foreground-muted))]">
          Página {totalPages > 0 ? page : 0} de {totalPages}
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="flex items-center gap-2 text-sm text-[hsl(var(--foreground-muted))]">
          <span>Itens por página</span>
          <select
            value={limit}
            onChange={(event) => onLimitChange(Number(event.target.value))}
            className="h-10 rounded-[var(--radius-md)] border bg-white px-3 text-sm"
          >
            {PAGE_SIZE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-center gap-2">
          <AppButton
            type="button"
            variant="ghost"
            className="h-10 px-3"
            disabled={!canGoBack}
            onClick={() => onPageChange(page - 1)}
          >
            Anterior
          </AppButton>
          <AppButton
            type="button"
            variant="ghost"
            className="h-10 px-3"
            disabled={!canGoNext}
            onClick={() => onPageChange(page + 1)}
          >
            Próxima
          </AppButton>
        </div>
      </div>
    </AppCard>
  );
}
