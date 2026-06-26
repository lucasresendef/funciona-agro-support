import { cn } from "@/shared/lib/utils/cn";
import { Check, ChevronDown, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export interface SearchableOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

interface SearchableSelectProps {
  value: string;
  selectedLabel?: string;
  options: SearchableOption[];
  onSelect: (value: string) => void;
  search: string;
  onSearchChange: (search: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  loading?: boolean;
  emptyText?: string;
  disabled?: boolean;
  className?: string;
}

export function SearchableSelect({
  value,
  selectedLabel,
  options,
  onSelect,
  search,
  onSearchChange,
  placeholder = "Selecione",
  searchPlaceholder = "Buscar...",
  loading,
  emptyText = "Nenhum resultado",
  disabled,
  className,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handle = setTimeout(() => inputRef.current?.focus(), 10);
    return () => clearTimeout(handle);
  }, [open]);

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        className="inline-flex h-10 w-full items-center justify-between gap-2 rounded-[var(--radius-md)] border bg-white px-3 text-sm text-[hsl(var(--brand-dark))] outline-none transition focus:border-[hsl(var(--brand-dark))] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className={cn("truncate", !value && "text-[hsl(var(--foreground-muted))]")}>
          {value ? (selectedLabel ?? placeholder) : placeholder}
        </span>
        <ChevronDown size={16} className="shrink-0 text-[hsl(var(--foreground-muted))]" />
      </button>

      {open ? (
        <div
          className="absolute left-0 right-0 z-[60] mt-1 overflow-hidden rounded-[var(--radius-md)] border bg-white shadow-[var(--shadow-card)]"
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.stopPropagation();
              setOpen(false);
            }
          }}
        >
          <div className="flex items-center gap-2 border-b px-3">
            <Search size={14} className="shrink-0 text-[hsl(var(--foreground-muted))]" />
            <input
              ref={inputRef}
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder={searchPlaceholder}
              className="h-10 w-full bg-transparent text-sm outline-none"
            />
          </div>
          <div className="max-h-60 overflow-y-auto p-1">
            {loading ? (
              <p className="px-3 py-3 text-xs text-[hsl(var(--foreground-muted))]">Buscando...</p>
            ) : options.length === 0 ? (
              <p className="px-3 py-3 text-xs text-[hsl(var(--foreground-muted))]">{emptyText}</p>
            ) : (
              options.map((option) => {
                const selected = option.value === value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    disabled={option.disabled}
                    onClick={() => {
                      onSelect(option.value);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center justify-between gap-2 rounded-[var(--radius-md)] px-3 py-2 text-left text-sm transition",
                      option.disabled
                        ? "cursor-not-allowed opacity-40"
                        : "hover:bg-[hsl(var(--surface-muted))]",
                      selected && "bg-[hsl(var(--brand-light))]",
                    )}
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-[hsl(var(--brand-dark))]">
                        {option.label}
                      </span>
                      {option.description ? (
                        <span className="block truncate text-xs text-[hsl(var(--foreground-muted))]">
                          {option.description}
                        </span>
                      ) : null}
                    </span>
                    {selected ? (
                      <Check size={16} className="shrink-0 text-[hsl(var(--brand-dark))]" />
                    ) : null}
                  </button>
                );
              })
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
