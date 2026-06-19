import { cn } from "@/shared/lib/utils/cn";

export function LoadingSkeleton({ className }: { className?: string }) {
  return <div className={cn("shimmer rounded-[var(--radius-sm)]", className)} />;
}
