import { cn } from "@/shared/lib/utils/cn";
import * as Select from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";

export interface AppSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface AppSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: AppSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
}

// Radix proibe Select.Item com value="". Mapeamos "" <-> sentinela para suportar
// tanto placeholder (sem opcao vazia) quanto opcoes "Todos/Todas" (value="").
const EMPTY = "__app_select_empty__";

export function AppSelect({
  value,
  onValueChange,
  options,
  placeholder = "Selecione",
  disabled,
  className,
  ariaLabel,
}: AppSelectProps) {
  const hasEmptyOption = options.some((option) => option.value === "");
  const mappedValue = value === "" && hasEmptyOption ? EMPTY : value;

  return (
    <Select.Root
      value={mappedValue}
      onValueChange={(next) => onValueChange(next === EMPTY ? "" : next)}
      disabled={disabled}
    >
      <Select.Trigger
        aria-label={ariaLabel}
        className={cn(
          "inline-flex h-10 w-full items-center justify-between gap-2 rounded-[var(--radius-md)] border bg-white px-3 text-sm text-[hsl(var(--brand-dark))] outline-none transition focus:border-[hsl(var(--brand-dark))] disabled:cursor-not-allowed disabled:opacity-60 data-[placeholder]:text-[hsl(var(--foreground-muted))]",
          className,
        )}
      >
        <span className="truncate">
          <Select.Value placeholder={placeholder} />
        </span>
        <Select.Icon>
          <ChevronDown size={16} className="shrink-0 text-[hsl(var(--foreground-muted))]" />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content
          position="popper"
          sideOffset={6}
          className="z-[60] max-h-[min(18rem,var(--radix-select-content-available-height))] w-[var(--radix-select-trigger-width)] overflow-hidden rounded-[var(--radius-md)] border bg-white shadow-[var(--shadow-card)]"
        >
          <Select.Viewport className="p-1">
            {options.map((option) => (
              <Select.Item
                key={option.value || EMPTY}
                value={option.value || EMPTY}
                disabled={option.disabled}
                className="relative flex cursor-pointer select-none items-center justify-between gap-2 rounded-[var(--radius-md)] px-3 py-2 text-sm text-[hsl(var(--brand-dark))] outline-none data-[disabled]:cursor-not-allowed data-[highlighted]:bg-[hsl(var(--surface-muted))] data-[disabled]:opacity-40"
              >
                <Select.ItemText>{option.label}</Select.ItemText>
                <Select.ItemIndicator>
                  <Check size={16} className="text-[hsl(var(--brand-dark))]" />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
