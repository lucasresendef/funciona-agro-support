import { getApiErrorMessage } from "@/shared/lib/http/security";
import { AppButton } from "@/shared/ui/components/AppButton";
import { AppDialog } from "@/shared/ui/components/AppDialog";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { operationsApi } from "../operations.api";
import type { FieldOperationEntity } from "../operations.types";
import {
  computeConsumed,
  formatNumber,
  num,
  operationLabel,
  parseDecimalInput,
  unitSymbol,
} from "../operations.utils";

const inputClassName = "h-10 w-full rounded-[var(--radius-md)] border bg-white px-3 text-sm";
const labelClassName = "text-xs font-semibold text-[hsl(var(--foreground-muted))]";

interface ItemForm {
  quantityReturned: string;
  notes: string;
}

interface Props {
  operation: FieldOperationEntity | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFinished: () => void;
}

export function FinalizeOperationDialog({ operation, open, onOpenChange, onFinished }: Props) {
  const [forms, setForms] = useState<Record<string, ItemForm>>({});

  useEffect(() => {
    if (operation && open) {
      const initial: Record<string, ItemForm> = {};
      for (const item of operation.items ?? []) {
        const returned = num(item.quantityReturned);
        initial[item.id] = {
          quantityReturned: returned > 0 ? String(returned) : "",
          notes: item.notes ?? "",
        };
      }
      setForms(initial);
    }
  }, [operation, open]);

  const finalizeMutation = useMutation({
    mutationFn: () => {
      if (!operation) throw new Error("Operação inválida.");
      const now = new Date().toISOString();
      return operationsApi.update(operation.id, {
        status: "FINISHED",
        startedAt: operation.startedAt ?? operation.operationDate,
        finishedAt: now,
        items: (operation.items ?? []).map((item) => {
          const form = forms[item.id] ?? { quantityReturned: "", notes: "" };
          const sent = num(item.quantitySent);
          const returned = parseDecimalInput(form.quantityReturned) ?? 0;
          return {
            id: item.id,
            quantityReturned: returned,
            quantityConsumed: computeConsumed(sent, returned),
            notes: form.notes.trim() || null,
          };
        }),
      });
    },
    onSuccess: () => {
      toast.success("Operação finalizada");
      onFinished();
      onOpenChange(false);
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Falha ao finalizar operação")),
  });

  function validateAndSubmit() {
    if (!operation) return;
    for (const item of operation.items ?? []) {
      const form = forms[item.id] ?? { quantityReturned: "", notes: "" };
      const returned = parseDecimalInput(form.quantityReturned);
      const sent = num(item.quantitySent);
      if (form.quantityReturned.trim() !== "" && (returned === null || returned < 0)) {
        return toast.error(`${item.product?.name ?? "Item"}: informe um número válido.`);
      }
      if (returned !== null && returned > sent + 1e-6) {
        return toast.error(
          `${item.product?.name ?? "Item"}: devolução maior que o enviado (${formatNumber(sent)}).`,
        );
      }
    }
    finalizeMutation.mutate();
  }

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChange}
      title={operation ? `Devolutiva — ${operationLabel(operation)}` : "Devolutiva"}
      description="Informe a quantidade devolvida de cada item. O consumo é calculado automaticamente."
      contentClassName="max-w-2xl max-h-[90vh] overflow-y-auto"
      footer={
        <>
          <AppButton type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </AppButton>
          <AppButton
            type="button"
            disabled={finalizeMutation.isPending}
            onClick={validateAndSubmit}
          >
            {finalizeMutation.isPending ? "Salvando..." : "Concluir devolutiva"}
          </AppButton>
        </>
      }
    >
      <div className="grid gap-3">
        {(operation?.items ?? []).map((item) => {
          const form = forms[item.id] ?? { quantityReturned: "", notes: "" };
          const sent = num(item.quantitySent);
          const returned = parseDecimalInput(form.quantityReturned) ?? 0;
          const consumed = computeConsumed(sent, returned);
          const symbol = unitSymbol(item);
          return (
            <div key={item.id} className="grid gap-2 rounded-[var(--radius-md)] border p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-semibold text-[hsl(var(--brand-dark))]">
                  {item.product?.name ?? "Produto"}
                </span>
                <span className="text-xs text-[hsl(var(--foreground-muted))]">
                  Enviado: {formatNumber(sent)} {symbol}
                </span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <label className="grid gap-1">
                  <span className={labelClassName}>Quantidade devolvida</span>
                  <input
                    className={inputClassName}
                    inputMode="decimal"
                    value={form.quantityReturned}
                    onChange={(event) =>
                      setForms((prev) => ({
                        ...prev,
                        [item.id]: { ...form, quantityReturned: event.target.value },
                      }))
                    }
                    placeholder="0,00"
                  />
                </label>
                <div className="grid gap-1">
                  <span className={labelClassName}>Consumo calculado</span>
                  <div className="flex h-10 items-center rounded-[var(--radius-md)] bg-[hsl(var(--surface-muted))] px-3 text-sm font-semibold text-[hsl(var(--brand-dark))]">
                    {formatNumber(consumed)} {symbol}
                  </div>
                </div>
              </div>
              <input
                className={inputClassName}
                value={form.notes}
                onChange={(event) =>
                  setForms((prev) => ({
                    ...prev,
                    [item.id]: { ...form, notes: event.target.value },
                  }))
                }
                placeholder="Observação (opcional)"
              />
            </div>
          );
        })}
      </div>
    </AppDialog>
  );
}
