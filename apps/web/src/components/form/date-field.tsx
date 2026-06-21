"use client";

import { IconCalendar, IconChevronLeft, IconChevronRight, IconClock } from "@tabler/icons-react";
import { useEffect, useMemo, useRef, useState } from "react";

export type DateFieldMode = "date" | "time" | "datetime";

export interface DateFieldLabels {
  today: string;
  clear: string;
  now: string;
}

const pad = (n: number) => String(n).padStart(2, "0");
const toISO = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

interface Parsed {
  date: Date | null;
  h: number | null;
  m: number | null;
}

/** Split a stored value into its date + time parts according to the mode. */
function parseValue(value: string | undefined, mode: DateFieldMode): Parsed {
  const out: Parsed = { date: null, h: null, m: null };
  if (!value) return out;
  if (mode === "time") {
    const t = /^(\d{2}):(\d{2})/.exec(value);
    if (t) {
      out.h = Number(t[1]);
      out.m = Number(t[2]);
    }
    return out;
  }
  const [datePart, timePart] = value.split("T");
  const d = /^(\d{4})-(\d{2})-(\d{2})$/.exec(datePart ?? "");
  if (d) {
    const parsed = new Date(Number(d[1]), Number(d[2]) - 1, Number(d[3]));
    if (!Number.isNaN(parsed.getTime())) out.date = parsed;
  }
  const t = timePart ? /^(\d{2}):(\d{2})/.exec(timePart) : null;
  if (t) {
    out.h = Number(t[1]);
    out.m = Number(t[2]);
  }
  return out;
}

/**
 * Styled date / time / datetime picker matching the app UI, replacing the
 * browser's native (unstylable) controls. Emits the same value shapes as the
 * native inputs — `YYYY-MM-DD` (date), `HH:MM` (time), `YYYY-MM-DDTHH:MM`
 * (datetime) — so form handling is unchanged. Locale-aware names; Monday-first.
 */
export function DateField({
  id,
  mode,
  value,
  onChange,
  disabled,
  invalid,
  placeholder,
  labels,
}: {
  id?: string;
  mode: DateFieldMode;
  value?: string;
  onChange: (value: string | undefined) => void;
  disabled?: boolean;
  invalid?: boolean;
  placeholder?: string;
  labels: DateFieldLabels;
}) {
  const showCalendar = mode !== "time";
  const showTime = mode !== "date";
  const parsed = parseValue(value, mode);

  const [open, setOpen] = useState(false);
  const [view, setView] = useState(() => {
    const base = parsed.date ?? new Date();
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

  const weekdays = useMemo(() => {
    const fmt = new Intl.DateTimeFormat(locale, { weekday: "short" });
    return Array.from({ length: 7 }, (_, i) => fmt.format(new Date(2024, 0, 1 + i)));
  }, [locale]);

  const monthLabel = useMemo(
    () => new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(view),
    [locale, view],
  );

  const days = useMemo(() => {
    const first = new Date(view.getFullYear(), view.getMonth(), 1);
    const offset = (first.getDay() + 6) % 7;
    const start = new Date(first);
    start.setDate(first.getDate() - offset);
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [view]);

  const today = new Date();

  // Build the stored value from the current date + time parts.
  function emit(date: Date | null, h: number | null, m: number | null) {
    if (mode === "time") {
      if (h === null || m === null) return onChange(undefined);
      return onChange(`${pad(h)}:${pad(m)}`);
    }
    if (!date) return onChange(undefined);
    if (mode === "date") return onChange(toISO(date));
    return onChange(`${toISO(date)}T${pad(h ?? 0)}:${pad(m ?? 0)}`);
  }

  function pickDay(d: Date) {
    emit(d, parsed.h, parsed.m);
    if (mode === "date") setOpen(false); // datetime stays open to set the time
  }
  function setTime(h: number, m: number) {
    emit(parsed.date ?? today, h, m);
  }

  const displayValue = useMemo(() => {
    const hasTime = parsed.h !== null && parsed.m !== null;
    const timeStr = hasTime ? `${pad(parsed.h!)}:${pad(parsed.m!)}` : "";
    if (mode === "time") return timeStr;
    if (!parsed.date) return "";
    const dateStr = new Intl.DateTimeFormat(locale, {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(parsed.date);
    return mode === "datetime" && timeStr ? `${dateStr} · ${timeStr}` : dateStr;
  }, [parsed.date, parsed.h, parsed.m, mode, locale]);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);
  const selectClass =
    "h-9 rounded-md border border-input bg-background px-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

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
        {mode === "time" ? (
          <IconClock size={16} stroke={1.75} className="shrink-0 text-muted-foreground" />
        ) : (
          <IconCalendar size={16} stroke={1.75} className="shrink-0 text-muted-foreground" />
        )}
      </button>

      {open && (
        <div
          role="dialog"
          className="absolute left-0 z-50 mt-1.5 w-72 rounded-lg border border-border bg-popover p-3 text-popover-foreground shadow-md"
        >
          {showCalendar && (
            <>
              <div className="mb-2 flex items-center justify-between">
                <button
                  type="button"
                  aria-label="Previous month"
                  onClick={() => setView((v) => new Date(v.getFullYear(), v.getMonth() - 1, 1))}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <IconChevronLeft size={16} stroke={2} />
                </button>
                <span className="text-sm font-medium capitalize text-foreground">{monthLabel}</span>
                <button
                  type="button"
                  aria-label="Next month"
                  onClick={() => setView((v) => new Date(v.getFullYear(), v.getMonth() + 1, 1))}
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
                  const isSelected = parsed.date ? sameDay(d, parsed.date) : false;
                  const isToday = sameDay(d, today);
                  return (
                    <button
                      key={d.toISOString()}
                      type="button"
                      onClick={() => pickDay(d)}
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
            </>
          )}

          {showTime && (
            <div
              className={`flex items-center justify-center gap-2 ${showCalendar ? "mt-2 border-t border-border pt-2" : ""}`}
            >
              <IconClock size={15} stroke={1.75} className="text-muted-foreground" />
              <select
                aria-label="Hour"
                value={parsed.h ?? ""}
                onChange={(e) => setTime(Number(e.target.value), parsed.m ?? 0)}
                className={selectClass}
              >
                <option value="" disabled>
                  --
                </option>
                {hours.map((h) => (
                  <option key={h} value={h}>
                    {pad(h)}
                  </option>
                ))}
              </select>
              <span className="text-muted-foreground">:</span>
              <select
                aria-label="Minute"
                value={parsed.m ?? ""}
                onChange={(e) => setTime(parsed.h ?? 0, Number(e.target.value))}
                className={selectClass}
              >
                <option value="" disabled>
                  --
                </option>
                {minutes.map((m) => (
                  <option key={m} value={m}>
                    {pad(m)}
                  </option>
                ))}
              </select>
            </div>
          )}

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
                const now = new Date();
                setView(new Date(now.getFullYear(), now.getMonth(), 1));
                emit(now, now.getHours(), now.getMinutes());
                if (mode === "date") setOpen(false);
              }}
              className="font-medium text-primary hover:underline"
            >
              {mode === "date" ? labels.today : labels.now}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
