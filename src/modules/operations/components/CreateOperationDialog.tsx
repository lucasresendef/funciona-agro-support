import { adminOperationsApi } from "@/modules/admin/admin-operations.api";
import type { InventoryBalanceEntity } from "@/modules/admin/contracts/admin-operations.dto";
import { queryKeys } from "@/shared/config/query-keys";
import { getApiErrorMessage } from "@/shared/lib/http/security";
import { AppButton } from "@/shared/ui/components/AppButton";
import { AppDialog } from "@/shared/ui/components/AppDialog";
import { AppSelect } from "@/shared/ui/components/AppSelect";
import { SearchableSelect } from "@/shared/ui/components/SearchableSelect";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Check, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { operationsApi } from "../operations.api";
import { num, parseDecimalInput } from "../operations.utils";

const inputClassName = "h-10 w-full rounded-[var(--radius-md)] border bg-white px-3 text-sm";
const textareaClassName =
  "min-h-16 w-full rounded-[var(--radius-md)] border bg-white px-3 py-2 text-sm";
const labelClassName = "text-xs font-semibold text-[hsl(var(--foreground-muted))]";

interface ItemForm {
  key: string;
  productId: string;
  productName: string;
  unitSymbol: string;
  availableBase: number;
  quantitySent: string;
  unitCost: string;
  notes: string;
}

let itemSeq = 0;
function newItem(): ItemForm {
  itemSeq += 1;
  return {
    key: `item-${itemSeq}`,
    productId: "",
    productName: "",
    unitSymbol: "",
    availableBase: 0,
    quantitySent: "",
    unitCost: "",
    notes: "",
  };
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

export function CreateOperationDialog({ open, onOpenChange, onCreated }: Props) {
  const [farmId, setFarmId] = useState("");
  const [fieldIds, setFieldIds] = useState<string[]>([]);
  const [inventoryLocationId, setInventoryLocationId] = useState("");
  const [description, setDescription] = useState("");
  const [items, setItems] = useState<ItemForm[]>([newItem()]);
  const [productSearch, setProductSearch] = useState("");
  const [productSearchDebounced, setProductSearchDebounced] = useState("");

  useEffect(() => {
    if (!open) {
      setFarmId("");
      setFieldIds([]);
      setInventoryLocationId("");
      setDescription("");
      setItems([newItem()]);
      setProductSearch("");
      setProductSearchDebounced("");
    }
  }, [open]);

  useEffect(() => {
    const handle = setTimeout(() => setProductSearchDebounced(productSearch), 300);
    return () => clearTimeout(handle);
  }, [productSearch]);

  const farmsQuery = useQuery({
    queryKey: [...queryKeys.farms, "op-create"],
    queryFn: () => adminOperationsApi.listFarms({ page: 1, limit: 100, active: true }),
    enabled: open,
  });
  const fieldsQuery = useQuery({
    queryKey: [...queryKeys.fields, "op-create", farmId],
    queryFn: () => adminOperationsApi.listFields({ page: 1, limit: 100, farmId, active: true }),
    enabled: open && Boolean(farmId),
  });
  const locationsQuery = useQuery({
    queryKey: [...queryKeys.inventoryLocations, "op-create", farmId],
    queryFn: () =>
      adminOperationsApi.listInventoryLocations({ page: 1, limit: 100, farmId, active: true }),
    enabled: open && Boolean(farmId),
  });
  const balancesQuery = useQuery({
    queryKey: [
      ...queryKeys.inventoryBalance,
      "op-create",
      farmId,
      inventoryLocationId,
      productSearchDebounced,
    ],
    queryFn: () =>
      adminOperationsApi.listInventoryBalances({
        page: 1,
        limit: 100,
        farmId,
        inventoryLocationId,
        search: productSearchDebounced || undefined,
        active: true,
      }),
    enabled: open && Boolean(farmId) && Boolean(inventoryLocationId),
  });

  const farms = farmsQuery.data?.data ?? [];
  const fields = fieldsQuery.data?.data ?? [];
  const locations = locationsQuery.data?.data ?? [];
  const balances = balancesQuery.data?.data ?? [];

  const balanceByProduct = useMemo(() => {
    const map = new Map<string, InventoryBalanceEntity>();
    for (const balance of balances) {
      if (balance.product?.id) map.set(balance.product.id, balance);
    }
    return map;
  }, [balances]);

  function reservedForProduct(productId: string, skipIndex: number): number {
    let total = 0;
    items.forEach((it, idx) => {
      if (idx === skipIndex) return;
      if (it.productId === productId) total += parseDecimalInput(it.quantitySent) ?? 0;
    });
    return total;
  }

  function availableForItem(item: ItemForm, index: number): number {
    const available = item.availableBase - reservedForProduct(item.productId, index);
    return available > 0 ? available : 0;
  }

  function handleFarmChange(value: string) {
    setFarmId(value);
    setFieldIds([]);
    setInventoryLocationId("");
    setItems([newItem()]);
  }
  function handleLocationChange(value: string) {
    setInventoryLocationId(value);
    setItems([newItem()]);
  }
  function toggleField(id: string) {
    setFieldIds((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]));
  }
  function updateItem(index: number, patch: Partial<ItemForm>) {
    setItems((prev) => prev.map((it, idx) => (idx === index ? { ...it, ...patch } : it)));
  }
  function onSelectProduct(index: number, productId: string) {
    const balance = balanceByProduct.get(productId);
    updateItem(index, {
      productId,
      productName: balance?.product.name ?? "",
      unitSymbol: balance?.product.unitOfMeasure?.symbol ?? "",
      availableBase: num(balance?.quantity),
      unitCost: balance ? String(num(balance.averageUnitCost)) : "",
    });
    setProductSearch("");
  }

  const createMutation = useMutation({
    mutationFn: () => {
      const now = new Date().toISOString();
      return operationsApi.create({
        farmId,
        fieldIds,
        inventoryLocationId,
        operationDate: now,
        startedAt: now,
        status: "OPEN",
        description: description.trim() || null,
        items: items.map((it) => {
          const sent = parseDecimalInput(it.quantitySent) ?? 0;
          return {
            productId: it.productId,
            quantitySent: sent,
            quantityConsumed: sent,
            quantityReturned: 0,
            unitCostAtOperation: parseDecimalInput(it.unitCost) ?? 0,
            notes: it.notes.trim() || null,
          };
        }),
      });
    },
    onSuccess: () => {
      toast.success("Operação criada com sucesso");
      onCreated();
      onOpenChange(false);
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Falha ao criar operação")),
  });

  function validateAndSubmit() {
    if (!farmId) return toast.error("Selecione a fazenda.");
    if (fieldIds.length === 0) return toast.error("Selecione ao menos um talhão.");
    if (!inventoryLocationId) return toast.error("Selecione o local de estoque.");
    if (items.length === 0) return toast.error("Adicione ao menos um item.");
    for (let i = 0; i < items.length; i += 1) {
      const it = items[i];
      const sent = parseDecimalInput(it.quantitySent);
      const cost = parseDecimalInput(it.unitCost);
      if (!it.productId) return toast.error(`Item ${i + 1}: selecione o produto.`);
      if (sent === null || sent <= 0)
        return toast.error(`Item ${i + 1}: informe a quantidade enviada.`);
      if (cost === null || cost < 0) return toast.error(`Item ${i + 1}: informe o custo unitário.`);
      const available = availableForItem(it, i);
      if (sent > available + 1e-6)
        return toast.error(
          `Item ${i + 1}: quantidade maior que o saldo disponível (${available.toFixed(2)}).`,
        );
    }
    createMutation.mutate();
  }

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Nova operação"
      description="Envie produtos do estoque para os talhões."
      contentClassName="max-w-3xl max-h-[90vh] overflow-y-auto"
      footer={
        <>
          <AppButton type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </AppButton>
          <AppButton type="button" disabled={createMutation.isPending} onClick={validateAndSubmit}>
            {createMutation.isPending ? "Salvando..." : "Criar operação"}
          </AppButton>
        </>
      }
    >
      <div className="grid gap-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="grid gap-1">
            <span className={labelClassName}>Fazenda</span>
            <AppSelect
              value={farmId}
              onValueChange={(value) => handleFarmChange(value)}
              options={farms.map((farm) => ({ value: farm.id, label: farm.name }))}
              placeholder="Selecione a fazenda"
              ariaLabel="Fazenda"
            />
          </div>
          <div className="grid gap-1">
            <span className={labelClassName}>Local de estoque</span>
            <AppSelect
              value={inventoryLocationId}
              onValueChange={(value) => handleLocationChange(value)}
              options={locations.map((loc) => ({ value: loc.id, label: loc.name }))}
              placeholder="Selecione o local"
              disabled={!farmId}
              ariaLabel="Local de estoque"
            />
          </div>
        </div>

        <div className="grid gap-1">
          <span className={labelClassName}>
            Talhões{fieldIds.length > 0 ? ` (${fieldIds.length})` : ""}
          </span>
          {!farmId ? (
            <p className="text-sm text-[hsl(var(--foreground-muted))]">
              Selecione a fazenda primeiro.
            </p>
          ) : fields.length === 0 ? (
            <p className="text-sm text-[hsl(var(--foreground-muted))]">Nenhum talhão disponível.</p>
          ) : (
            <div className="flex max-h-44 flex-wrap gap-1.5 overflow-y-auto rounded-[var(--radius-md)] border p-2">
              {fields.map((field) => {
                const selected = fieldIds.includes(field.id);
                return (
                  <button
                    type="button"
                    key={field.id}
                    aria-pressed={selected}
                    onClick={() => toggleField(field.id)}
                    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition active:scale-[0.97] ${
                      selected
                        ? "border-[hsl(var(--brand-dark))]/40 bg-[hsl(var(--brand-light))] text-[hsl(var(--brand-dark))]"
                        : "text-[hsl(var(--foreground-muted))] hover:border-[hsl(var(--brand-dark))] hover:text-[hsl(var(--brand-dark))]"
                    }`}
                  >
                    {selected ? <Check size={12} /> : <Plus size={12} className="opacity-40" />}
                    {field.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <label className="grid gap-1">
          <span className={labelClassName}>Descrição (opcional)</span>
          <textarea
            className={textareaClassName}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Observações da operação"
          />
        </label>

        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-[hsl(var(--brand-dark))]">Itens</span>
            <AppButton
              type="button"
              variant="secondary"
              className="h-9"
              onClick={() => setItems((prev) => [...prev, newItem()])}
            >
              <Plus size={16} />
              <span className="ml-1">Item</span>
            </AppButton>
          </div>
          {!inventoryLocationId ? (
            <p className="text-sm text-[hsl(var(--foreground-muted))]">
              Selecione o local de estoque para listar os produtos disponíveis.
            </p>
          ) : (
            items.map((item, index) => {
              const available = item.productId ? availableForItem(item, index) : 0;
              const sentValue = parseDecimalInput(item.quantitySent);
              const exceeds = sentValue !== null && sentValue > available + 1e-6;
              const remaining = sentValue !== null ? available - sentValue : available;
              const itemSymbol = item.unitSymbol;
              return (
                <div key={item.key} className="grid gap-2 rounded-[var(--radius-md)] border p-3">
                  <div className="flex items-center justify-between">
                    <span className={labelClassName}>Item {index + 1}</span>
                    {items.length > 1 ? (
                      <button
                        type="button"
                        aria-label={`Remover item ${index + 1}`}
                        className="text-rose-600"
                        onClick={() => setItems((prev) => prev.filter((_, i) => i !== index))}
                      >
                        <Trash2 size={16} />
                      </button>
                    ) : null}
                  </div>
                  <SearchableSelect
                    value={item.productId}
                    selectedLabel={item.productName}
                    onSelect={(value) => onSelectProduct(index, value)}
                    search={productSearch}
                    onSearchChange={setProductSearch}
                    loading={balancesQuery.isFetching}
                    placeholder="Selecione o produto"
                    searchPlaceholder="Buscar produto por nome..."
                    emptyText="Nenhum produto encontrado"
                    options={balances.map((balance) => {
                      const stock = num(balance.quantity);
                      const symbol = balance.product.unitOfMeasure?.symbol ?? "";
                      return {
                        value: balance.product.id,
                        label: balance.product.name,
                        description:
                          stock > 0
                            ? `saldo: ${stock.toLocaleString("pt-BR", { maximumFractionDigits: 2 })} ${symbol}`
                            : "sem saldo neste local",
                        disabled: stock <= 0,
                      };
                    })}
                  />
                  <div className="grid gap-2 sm:grid-cols-2">
                    <label className="grid gap-1">
                      <span className={labelClassName}>
                        Quantidade enviada
                        {item.productId
                          ? ` (disp.: ${available.toLocaleString("pt-BR", { maximumFractionDigits: 2 })})`
                          : ""}
                      </span>
                      <input
                        className={`${inputClassName} ${
                          exceeds ? "border-rose-500 focus:border-rose-500" : ""
                        }`}
                        inputMode="decimal"
                        value={item.quantitySent}
                        onChange={(event) =>
                          updateItem(index, { quantitySent: event.target.value })
                        }
                        placeholder="0,00"
                        aria-invalid={exceeds}
                      />
                      {item.productId && sentValue !== null && sentValue > 0 ? (
                        exceeds ? (
                          <span className="text-xs font-semibold text-rose-600">
                            Excede o disponível em{" "}
                            {(sentValue - available).toLocaleString("pt-BR", {
                              maximumFractionDigits: 2,
                            })}{" "}
                            {itemSymbol}
                          </span>
                        ) : (
                          <span className="text-xs text-[hsl(var(--foreground-muted))]">
                            Restante após envio:{" "}
                            {remaining.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}{" "}
                            {itemSymbol}
                          </span>
                        )
                      ) : null}
                    </label>
                    <label className="grid gap-1">
                      <span className={labelClassName}>Custo unitário (R$)</span>
                      <input
                        className={inputClassName}
                        inputMode="decimal"
                        value={item.unitCost}
                        onChange={(event) => updateItem(index, { unitCost: event.target.value })}
                        placeholder="0,00"
                      />
                    </label>
                  </div>
                  <input
                    className={inputClassName}
                    value={item.notes}
                    onChange={(event) => updateItem(index, { notes: event.target.value })}
                    placeholder="Observação do item (opcional)"
                  />
                </div>
              );
            })
          )}
        </div>
      </div>
    </AppDialog>
  );
}
