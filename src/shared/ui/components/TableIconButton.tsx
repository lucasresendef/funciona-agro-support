import type { ButtonHTMLAttributes, PropsWithChildren } from "react";
import { cn } from "@/shared/lib/utils/cn";

type Variant = "neutral" | "danger";

interface TableIconButtonProps
  extends PropsWithChildren,
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  variant?: Variant;
}

const styles: Record<Variant, string> = {
  neutral:
    "border-[hsl(var(--border))] text-[hsl(var(--foreground-muted))] hover:border-[hsl(var(--brand-light))] hover:bg-[hsl(var(--surface-muted))] hover:text-[hsl(var(--brand-dark))]",
  danger: "border-red-200 text-red-500 hover:border-red-300 hover:bg-red-50 hover:text-red-600",
};

export function TableIconButton({
  className,
  variant = "neutral",
  children,
  ...props
}: TableIconButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-full border transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        styles[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
