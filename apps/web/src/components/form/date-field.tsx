"use client";

import { IconCalendar, IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { useEffect, useMemo, useRef, useState } from "react";

export interface DateFieldLabels {
  today: string;
  clear: string;
}

const pad = (n: number) => String(n).padStart(2, "0");
const toISO = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
function parseISO(s: string | undefined): Date | null {
  if (!s) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(d.getTime()) ? null : d;
}
const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

/**
 * Styled date picker matching the app UI — a calendar popover instead of the
 * browser's native (unstylable) date control. Emits a `YYYY-MM-DD` string, the
 * same value shape as `<input type="date">`, so form handling is unchanged.
 * Month/weekday names follow the browser locale; Monday-first week.
 */
export function DateField({
  id,
  value,
  onChange,
  disabled,
  invalid,
  placeholder,
  labels,
}: {
  id?: string;
  value?: string;
  onChange: (value: string | undefined) => void;
  disabled?: boolean;
  invalid?: boolean;
  placeholder?: string;
  labels: DateFieldLabels;
}) {
  const selected = parseISO(value);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState(() => {
    const base = selected ?? new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });
  const ref = useRef<HTMLDivElement>(null);
  const locale = typeof navigator !== "undefined" ? navigator.language : "en";

  useEffect(() => {
    if (!open) return;
    function onPointer(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Monday-first weekday short names (2024-01-01 is a Monday).
  const weekdays = useMemo(() => {
    const fmt = new Intl.DateTimeFormat(locale, { weekday: "short" });
    return Array.from({ length: 7 }, (_, i) => fmt.format(new Date(2024, 0, 1 + i)));
  }, [locale]);

  const monthLabel = useMemo(
    () => new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(view),
    [locale, view],
  );

  const displayValue = selected
    ? new Intl.DateTimeFormat(locale, { day: "2-digit", month: "long", year: "numeric" }).format(selected)
    : "";

  // Build the 6×7 grid of days (Monday-first), including leading/trailing days.
  const days = useMemo(() => {
    const first = new Date(view.getFullYear(), view.getMonth(), 1);
    const offset = (first.getDay() + 6) % 7; // 0 = Monday
    const start = new Date(first);
    start.setDate(first.getDate() - offset);
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [view]);

  const today = new Date();
  const shiftMonth = (delta: number) =>
    setView((v) => new Date(v.getFullYear(), v.getMonth() + delta, 1));
  function pick(d: Date) {
    onChange(toISO(d));
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        id={id}
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={`flex h-10 w-full items-center justify-between rounded-md border bg-background px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 ${
          invalid ? "border-destructive" : "border-input"
        } ${displayValue ? "text-foreground" : "text-muted-foreground"}`}
      >
        <span>{displayValue || placeholder || "—"}</span>
        <IconCalendar size={16} stroke={1.75} className="shrink-0 text-muted-foreground" />
      </button>

      {open && (
        <div
          role="dialog"
          className="absolute left-0 z-50 mt-1.5 w-72 rounded-lg border border-border bg-popover p-3 text-popover-foreground shadow-md"
        >
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              aria-label="Previous month"
              onClick={() => shiftMonth(-1)}
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <IconChevronLeft size={16} stroke={2} />
            </button>
            <span className="text-sm font-medium capitalize text-foreground">{monthLabel}</span>
            <button
              type="button"
              aria-label="Next month"
              onClick={() => shiftMonth(1)}
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <IconChevronRight size={16} stroke={2} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-0.5">
            {weekdays.map((w) => (
              <div key={w} className="py-1 text-center text-[11px] font-medium text-muted-foreground">
                {w}
              </div>
            ))}
            {days.map((d) => {
              const inMonth = d.getMonth() === view.getMonth();
              const isSelected = selected ? sameDay(d, selected) : false;
              const isToday = sameDay(d, today);
              return (
                <button
                  key={d.toISOString()}
                  type="button"
                  onClick={() => pick(d)}
                  className={`flex h-8 items-center justify-center rounded-md text-sm transition-colors ${
                    isSelected
                      ? "bg-primary font-medium text-primary-foreground"
                      : inMonth
                        ? "text-foreground hover:bg-accent"
                        : "text-muted-foreground/40 hover:bg-accent"
                  } ${isToday && !isSelected ? "ring-1 ring-inset ring-primary/50" : ""}`}
                >
                  {d.getDate()}
                </button>
              );
            })}
          </div>

          <div className="mt-2 flex items-center justify-between border-t border-border pt-2 text-xs">
            <button
              type="button"
              onClick={() => {
                onChange(undefined);
                setOpen(false);
              }}
              className="font-medium text-muted-foreground transition-colors hover:text-destructive"
            >
              {labels.clear}
            </button>
            <button
              type="button"
              onClick={() => {
                setView(new Date(today.getFullYear(), today.getMonth(), 1));
                pick(today);
              }}
              className="font-medium text-primary hover:underline"
            >
              {labels.today}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
