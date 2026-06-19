import type { PropsWithChildren } from "react";
import { cn } from "@/shared/lib/utils/cn";

export function AppCard({ children, className }: PropsWithChildren<{ className?: string }>) {
  return (
    <section
      className={cn(
        "rounded-[var(--radius-lg)] border bg-[hsl(var(--surface))] p-5 shadow-[var(--shadow-card)]",
        className,
      )}
    >
      {children}
    </section>
  );
}
