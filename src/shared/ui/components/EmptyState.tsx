import { AppButton } from "./AppButton";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-dashed bg-[hsl(var(--surface-muted))] p-8 text-center">
      <h3 className="text-lg font-bold text-[hsl(var(--brand-dark))]">{title}</h3>
      <p className="mx-auto mt-2 max-w-lg text-sm text-[hsl(var(--foreground-muted))]">
        {description}
      </p>
      {actionLabel && onAction ? (
        <AppButton className="mt-5" onClick={onAction} type="button">
          {actionLabel}
        </AppButton>
      ) : null}
    </div>
  );
}
