import { cn } from "@/shared/lib/utils/cn";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export interface DateRange {
  from: string;
  to: string;
}

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  className?: string;
}

const WEEKDAYS = [
  { key: "sun", label: "D" },
  { key: "mon", label: "S" },
  { key: "tue", label: "T" },
  { key: "wed", label: "Q" },
  { key: "thu", label: "Q" },
  { key: "fri", label: "S" },
  { key: "sat", label: "S" },
];
const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

function parseISO(value: string): Date | null {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function toISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatBR(value: string): string {
  const date = parseISO(value);
  return date ? date.toLocaleDateString("pt-BR") : "";
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function sameDay(a: Date, b: Date): boolean {
  return toISO(a) === toISO(b);
}

function addDays(date: Date, amount: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

export function DateRangePicker({ value, onChange, className }: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState<Date | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const fromDate = parseISO(value.from);
  const toDate = parseISO(value.to);

  const [viewMonth, setViewMonth] = useState<Date>(() => {
    const base = toDate ?? fromDate ?? new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  useEffect(() => {
    if (!open) return;
    function onClick(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function handleDayClick(day: Date) {
    const iso = toISO(day);
    if (!fromDate || (fromDate && toDate)) {
      onChange({ from: iso, to: "" });
      setHovered(null);
      return;
    }
    if (day < fromDate) {
      onChange({ from: iso, to: value.from });
    } else {
      onChange({ from: value.from, to: iso });
    }
    setHovered(null);
  }

  function applyPreset(days: number) {
    const today = startOfDay(new Date());
    const start = addDays(today, -(days - 1));
    onChange({ from: toISO(start), to: toISO(today) });
    setViewMonth(new Date(today.getFullYear(), today.getMonth(), 1));
  }

  function applyThisMonth() {
    const today = startOfDay(new Date());
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    onChange({ from: toISO(start), to: toISO(today) });
    setViewMonth(start);
  }

  function shiftMonth(amount: number) {
    setViewMonth((current) => new Date(current.getFullYear(), current.getMonth() + amount, 1));
  }

  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const startWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: { key: string; date: Date | null }[] = [];
  for (let i = 0; i < startWeekday; i += 1) cells.push({ key: `pad-${i}`, date: null });
  for (let d = 1; d <= daysInMonth; d += 1) {
    const date = new Date(year, month, d);
    cells.push({ key: toISO(date), date });
  }

  const rangeEnd = toDate ?? (fromDate && hovered && hovered > fromDate ? hovered : null);
  const hasRange = Boolean(fromDate && rangeEnd);
  const today = startOfDay(new Date());

  const isStart = (day: Date) => (fromDate ? sameDay(day, fromDate) : false);
  const isEnd = (day: Date) => (rangeEnd ? sameDay(day, rangeEnd) : false);
  const inRange = (day: Date) => Boolean(fromDate && rangeEnd && day > fromDate && day < rangeEnd);

  const label =
    value.from && value.to
      ? `${formatBR(value.from)}  —  ${formatBR(value.to)}`
      : value.from
        ? `${formatBR(value.from)}  —  ...`
        : "Selecionar período";

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex h-10 w-full items-center gap-2 rounded-[var(--radius-md)] border bg-white px-3 text-left text-sm outline-none transition hover:border-[hsl(var(--brand-dark))]"
      >
        <CalendarDays size={16} className="shrink-0 text-[hsl(var(--brand-dark))]" />
        <span
          className={cn(
            "truncate",
            value.from ? "text-[hsl(var(--foreground))]" : "text-[hsl(var(--foreground-muted))]",
          )}
        >
          {label}
        </span>
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="absolute left-0 z-50 mt-2 w-[300px] max-w-[calc(100vw-2rem)] rounded-[var(--radius-lg)] border bg-[hsl(var(--surface))] p-3 shadow-[var(--shadow-card)] sm:left-auto sm:right-0"
          >
            <div className="mb-3 flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => applyPreset(7)}
                className="rounded-full bg-[hsl(var(--brand-light))] px-2.5 py-1 text-xs font-semibold text-[hsl(var(--brand-dark))] transition hover:brightness-95"
              >
                Últimos 7 dias
              </button>
              <button
                type="button"
                onClick={() => applyPreset(30)}
                className="rounded-full bg-[hsl(var(--brand-light))] px-2.5 py-1 text-xs font-semibold text-[hsl(var(--brand-dark))] transition hover:brightness-95"
              >
                Últimos 30 dias
              </button>
              <button
                type="button"
                onClick={applyThisMonth}
                className="rounded-full bg-[hsl(var(--brand-light))] px-2.5 py-1 text-xs font-semibold text-[hsl(var(--brand-dark))] transition hover:brightness-95"
              >
                Este mês
              </button>
            </div>

            <div className="mb-2 flex items-center justify-between">
              <button
                type="button"
                aria-label="Mês anterior"
                onClick={() => shiftMonth(-1)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[hsl(var(--foreground-muted))] transition hover:bg-[hsl(var(--surface-muted))]"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm font-bold text-[hsl(var(--brand-dark))]">
                {MONTHS[month]} {year}
              </span>
              <button
                type="button"
                aria-label="Próximo mês"
                onClick={() => shiftMonth(1)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[hsl(var(--foreground-muted))] transition hover:bg-[hsl(var(--surface-muted))]"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="grid grid-cols-7 text-center text-[11px] font-semibold uppercase text-[hsl(var(--foreground-muted))]">
              {WEEKDAYS.map((weekday) => (
                <span key={weekday.key} className="py-1">
                  {weekday.label}
                </span>
              ))}
            </div>

            <div className="mt-1 grid grid-cols-7 gap-y-1" onMouseLeave={() => setHovered(null)}>
              {cells.map((cell) => {
                const day = cell.date;
                if (!day) return <span key={cell.key} />;
                const start = isStart(day);
                const end = isEnd(day);
                const within = inRange(day);
                const selectedEdge = start || end;
                const isToday = sameDay(day, today);
                return (
                  <div
                    key={cell.key}
                    className={cn(
                      "flex h-9 items-center justify-center",
                      (within || (selectedEdge && hasRange)) && "bg-[hsl(var(--brand-light))]",
                      start && hasRange && "rounded-l-full",
                      end && hasRange && "rounded-r-full",
                    )}
                  >
                    <button
                      type="button"
                      onMouseEnter={() => setHovered(day)}
                      onClick={() => handleDayClick(day)}
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-full text-sm transition",
                        selectedEdge
                          ? "brand-gradient font-bold text-white shadow-[var(--shadow-soft)]"
                          : "text-[hsl(var(--foreground))] hover:bg-[hsl(var(--surface-muted))]",
                        isToday && !selectedEdge && "ring-1 ring-[hsl(var(--brand))]",
                      )}
                    >
                      {day.getDate()}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="mt-3 flex items-center justify-between border-t pt-2">
              <button
                type="button"
                onClick={() => onChange({ from: "", to: "" })}
                className="text-xs font-semibold text-[hsl(var(--foreground-muted))] transition hover:text-[hsl(var(--brand-dark))]"
              >
                Limpar
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="brand-gradient rounded-full px-4 py-1.5 text-xs font-semibold text-white transition hover:brightness-105"
              >
                Aplicar
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
