import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle: string;
  actions?: ReactNode;
  breadcrumb?: string;
}

export function PageHeader({ title, subtitle, actions, breadcrumb }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        {breadcrumb ? (
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[hsl(var(--foreground-muted))]">
            {breadcrumb}
          </p>
        ) : null}
        <h1 className="text-2xl font-extrabold text-[hsl(var(--brand-dark))] md:text-3xl">
          {title}
        </h1>
        <p className="mt-1 text-sm text-[hsl(var(--foreground-muted))]">{subtitle}</p>
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}
