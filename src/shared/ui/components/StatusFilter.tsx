import { motion } from "framer-motion";
import { CircleCheck, CircleSlash } from "lucide-react";
import { useId } from "react";

interface StatusFilterProps {
  value: boolean;
  onChange: (active: boolean) => void;
  disabled?: boolean;
}

const OPTIONS = [
  { active: true, label: "Ativos", Icon: CircleCheck },
  { active: false, label: "Inativos", Icon: CircleSlash },
] as const;

export function StatusFilter({ value, onChange, disabled }: StatusFilterProps) {
  const pillId = useId();

  return (
    <div
      aria-label="Filtrar por status"
      className="relative inline-flex items-center gap-0.5 rounded-full border bg-white p-0.5"
    >
      {OPTIONS.map(({ active, label, Icon }) => {
        const selected = value === active;
        return (
          <button
            key={label}
            type="button"
            disabled={disabled}
            aria-pressed={selected}
            title={label}
            onClick={() => onChange(active)}
            className="relative inline-flex h-8 items-center gap-1.5 rounded-full px-2.5 text-xs font-semibold"
          >
            {selected ? (
              <motion.span
                layoutId={pillId}
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
                className={`absolute inset-0 rounded-full ${
                  active ? "brand-gradient" : "bg-amber-500"
                }`}
              />
            ) : null}
            <span
              className={`relative z-10 inline-flex items-center gap-1.5 transition-colors ${
                selected ? "text-white" : "text-[hsl(var(--foreground-muted))]"
              }`}
            >
              <Icon size={14} />
              <span className="hidden sm:inline">{label}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
