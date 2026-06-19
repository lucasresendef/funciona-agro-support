import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { PropsWithChildren, ReactNode } from "react";
import { cn } from "@/shared/lib/utils/cn";

interface AppDialogProps extends PropsWithChildren {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  footer?: ReactNode;
  contentClassName?: string;
}

export function AppDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  contentClassName,
}: AppDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-[hsl(var(--brand-dark))]/45 backdrop-blur-sm" />
        <Dialog.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-[var(--radius-lg)] border bg-[hsl(var(--surface))] p-6 shadow-[var(--shadow-card)] focus:outline-none",
            contentClassName,
          )}
        >
          <div className="mb-5 flex items-start justify-between gap-4">
            <div className="space-y-1">
              <Dialog.Title className="text-xl font-bold text-[hsl(var(--brand-dark))]">
                {title}
              </Dialog.Title>
              {description ? (
                <Dialog.Description className="text-sm text-[hsl(var(--foreground-muted))]">
                  {description}
                </Dialog.Description>
              ) : null}
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[hsl(var(--foreground-muted))] transition hover:bg-[hsl(var(--surface-muted))] hover:text-[hsl(var(--brand-dark))]"
                aria-label="Fechar"
              >
                <X size={18} />
              </button>
            </Dialog.Close>
          </div>

          <div className="space-y-4">{children}</div>

          {footer ? (
            <div className="mt-6 flex flex-wrap justify-end gap-3 border-t pt-4">{footer}</div>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
