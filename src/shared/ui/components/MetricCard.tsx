import type { ReactNode } from "react";
import { AppCard } from "./AppCard";

interface MetricCardProps {
  title: string;
  value: string;
  hint: string;
  icon: ReactNode;
}

export function MetricCard({ title, value, hint, icon }: MetricCardProps) {
  return (
    <AppCard className="fade-up">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[hsl(var(--foreground-muted))]">
            {title}
          </p>
          <p className="mt-2 text-3xl font-extrabold text-[hsl(var(--brand-dark))]">{value}</p>
          <p className="mt-1 text-xs text-[hsl(var(--foreground-muted))]">{hint}</p>
        </div>
        <span className="rounded-xl bg-[hsl(var(--brand-light))] p-2 text-[hsl(var(--brand-dark))]">
          {icon}
        </span>
      </div>
    </AppCard>
  );
}
