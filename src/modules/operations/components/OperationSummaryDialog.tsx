import { AppCard } from "@/shared/ui/components/AppCard";
import { AppDialog } from "@/shared/ui/components/AppDialog";
import { MetricCard } from "@/shared/ui/components/MetricCard";
import { ArrowDownToLine, ArrowUpFromLine, Coins, Sprout } from "lucide-react";
import type { FieldOperationEntity } from "../operations.types";
import {
  STATUS_BADGE_CLASS,
  STATUS_LABEL,
  fieldNames,
  formatCurrency,
  formatDateTime,
  formatNumber,
  itemConsumed,
  itemLineTotal,
  num,
  operationLabel,
  unitSymbol,
} from "../operations.utils";

interface Props {
  operation: FieldOperationEntity | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OperationSummaryDialog({ operation, open, onOpenChange }: Props) {
  const items = operation?.items ?? [];
  const totalSent = items.reduce((acc, item) => acc + num(item.quantitySent), 0);
  const totalReturned = items.reduce((acc, item) => acc + num(item.quantityReturned), 0);
  const totalConsumed = items.reduce((acc, item) => acc + itemConsumed(item), 0);
  const totalCost = items.reduce((acc, item) => acc + itemLineTotal(item), 0);

  const symbols = new Set(items.map((item) => unitSymbol(item)));
  const unitLabel = symbols.size === 1 ? [...symbols][0] : "un. mistas";

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChange}
      title={operation ? operationLabel(operation) : "Operação"}
      description="Resumo detalhado da operação."
      contentClassName="max-w-3xl max-h-[90vh] overflow-y-auto"
    >
      {!operation ? null : (
        <div className="grid gap-4">
          <AppCard>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_BADGE_CLASS[operation.status]}`}
              >
                {STATUS_LABEL[operation.status]}
              </span>
              <span className="text-xs text-[hsl(var(--foreground-muted))]">
                {formatDateTime(operation.operationDate)}
              </span>
            </div>
            <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs text-[hsl(var(--foreground-muted))]">Talhões</dt>
                <dd>{fieldNames(operation).join(", ") || "-"}</dd>
              </div>
              <div>
                <dt className="text-xs text-[hsl(var(--foreground-muted))]">Local de estoque</dt>
                <dd>{operation.inventoryLocation?.name ?? "-"}</dd>
              </div>
              <div>
                <dt className="text-xs text-[hsl(var(--foreground-muted))]">Início</dt>
                <dd>{formatDateTime(operation.startedAt)}</dd>
              </div>
              <div>
                <dt className="text-xs text-[hsl(var(--foreground-muted))]">Conclusão</dt>
                <dd>{formatDateTime(operation.finishedAt)}</dd>
              </div>
              {operation.description ? (
                <div className="sm:col-span-2">
                  <dt className="text-xs text-[hsl(var(--foreground-muted))]">Descrição</dt>
                  <dd>{operation.description}</dd>
                </div>
              ) : null}
            </dl>
          </AppCard>

          <div className="grid gap-3 sm:grid-cols-2">
            <MetricCard
              title="Enviado"
              value={`${formatNumber(totalSent)} ${unitLabel}`}
              hint="Total enviado ao campo"
              icon={<ArrowUpFromLine size={18} />}
            />
            <MetricCard
              title="Devolvido"
              value={`${formatNumber(totalReturned)} ${unitLabel}`}
              hint="Total retornado ao estoque"
              icon={<ArrowDownToLine size={18} />}
            />
            <MetricCard
              title="Consumido"
              value={`${formatNumber(totalConsumed)} ${unitLabel}`}
              hint="Total efetivamente usado"
              icon={<Sprout size={18} />}
            />
            <MetricCard
              title="Custo total"
              value={formatCurrency(totalCost)}
              hint="Custo do consumo"
              icon={<Coins size={18} />}
            />
          </div>

          <div className="grid gap-2">
            <h3 className="text-sm font-semibold text-[hsl(var(--brand-dark))]">
              Consumo por produto e talhão
            </h3>
            {items.map((item) => {
              const symbol = unitSymbol(item);
              const consumed = itemConsumed(item);
              const results = item.fieldResults ?? [];
              const totalAllocated = results.reduce(
                (acc, result) => acc + num(result.allocatedQuantityConsumed),
                0,
              );
              return (
                <AppCard key={item.id}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-[hsl(var(--brand-dark))]">
                      {item.product?.name ?? "Produto"}
                    </span>
                    <span className="text-xs text-[hsl(var(--foreground-muted))]">
                      {formatNumber(consumed)} {symbol} · {formatCurrency(itemLineTotal(item))}
                    </span>
                  </div>
                  {results.length === 0 ? (
                    <p className="mt-2 text-xs text-[hsl(var(--foreground-muted))]">
                      Sem distribuição por talhão.
                    </p>
                  ) : (
                    <ul className="mt-2 grid gap-1">
                      {results.map((result) => {
                        const allocated = num(result.allocatedQuantityConsumed);
                        const pct = totalAllocated > 0 ? (allocated / totalAllocated) * 100 : 0;
                        return (
                          <li key={result.id} className="flex items-center justify-between text-xs">
                            <span>{result.field?.name ?? result.fieldId}</span>
                            <span className="text-[hsl(var(--foreground-muted))]">
                              {formatNumber(allocated)} {symbol} ({pct.toFixed(0)}%)
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                  {item.notes ? (
                    <p className="mt-2 text-xs text-[hsl(var(--foreground-muted))]">
                      Obs.: {item.notes}
                    </p>
                  ) : null}
                </AppCard>
              );
            })}
          </div>
        </div>
      )}
    </AppDialog>
  );
}
