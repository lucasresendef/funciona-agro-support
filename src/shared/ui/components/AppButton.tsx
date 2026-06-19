import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/shared/lib/utils/cn";

type Variant = "primary" | "secondary" | "ghost";

interface AppButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const styles: Record<Variant, string> = {
  primary:
    "brand-gradient text-white shadow-[var(--shadow-soft)] hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--brand-dark))]",
  secondary:
    "bg-[hsl(var(--brand-light))] text-[hsl(var(--brand-dark))] hover:bg-[hsl(var(--brand-light))]/80",
  ghost: "bg-transparent text-[hsl(var(--foreground-muted))] hover:bg-[hsl(var(--surface-muted))]",
};

export function AppButton({ className, variant = "primary", ...props }: AppButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex h-11 items-center justify-center rounded-[var(--radius-md)] px-4 text-sm font-semibold transition-all",
        styles[variant],
        className,
      )}
      {...props}
    />
  );
}
