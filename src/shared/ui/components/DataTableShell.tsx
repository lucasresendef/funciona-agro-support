import type { ReactNode } from "react";
import { AppCard } from "./AppCard";
import { LoadingSkeleton } from "./LoadingSkeleton";

interface DataTableShellProps {
  isLoading: boolean;
  columns: string[];
  rows: ReactNode;
}

export function DataTableShell({ isLoading, columns, rows }: DataTableShellProps) {
  if (isLoading) {
    return (
      <AppCard>
        <div className="space-y-3">
          <LoadingSkeleton className="h-10 w-full" />
          <LoadingSkeleton className="h-12 w-full" />
          <LoadingSkeleton className="h-12 w-full" />
          <LoadingSkeleton className="h-12 w-full" />
        </div>
      </AppCard>
    );
  }

  return (
    <AppCard className="overflow-hidden p-0">
      <div className="overflow-auto">
        <table className="min-w-full text-left">
          <thead className="bg-[hsl(var(--surface-muted))]">
            <tr>
              {columns.map((column) => (
                <th
                  key={column}
                  className="px-4 py-3 text-xs font-extrabold uppercase tracking-wide text-[hsl(var(--foreground-muted))]"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </table>
      </div>
    </AppCard>
  );
}
