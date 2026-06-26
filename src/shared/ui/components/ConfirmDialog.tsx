import { AlertTriangle } from "lucide-react";
import { AppButton } from "./AppButton";
import { AppDialog } from "./AppDialog";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  isPending?: boolean;
  onConfirm: () => void;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  isPending = false,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      contentClassName="max-w-lg"
      footer={
        <>
          <AppButton type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </AppButton>
          <AppButton
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="bg-red-500 text-white hover:bg-red-600"
          >
            {isPending ? "Processando..." : confirmLabel}
          </AppButton>
        </>
      }
    >
      <div className="flex items-center gap-3 rounded-[var(--radius-md)] border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
        <AlertTriangle size={18} />
        <p>Essa ação mantém o histórico, mas retira o item da operação ativa.</p>
      </div>
    </AppDialog>
  );
}
