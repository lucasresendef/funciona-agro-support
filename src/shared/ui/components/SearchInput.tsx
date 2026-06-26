import { cn } from "@/shared/lib/utils/cn";
import { Search, X } from "lucide-react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Buscar...",
  className,
}: SearchInputProps) {
  return (
    <div className={cn("relative w-full", className)}>
      <Search
        size={16}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--foreground-muted))]"
      />
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-full border bg-white pl-9 pr-9 text-sm outline-none transition focus:border-[hsl(var(--brand-dark))]"
      />
      {value ? (
        <button
          type="button"
          aria-label="Limpar busca"
          onClick={() => onChange("")}
          className="absolute right-2 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-[hsl(var(--foreground-muted))] transition hover:bg-[hsl(var(--surface-muted))]"
        >
          <X size={14} />
        </button>
      ) : null}
    </div>
  );
}
