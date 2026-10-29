"use client";

import { useMemo, useRef, useState } from "react";

import { useDismiss } from "@/components/dashboard-kit/use-dismiss";
import { CalendarBlank, CaretLeft, CaretRight, Clock } from "@/components/icons";
import { cn } from "@/lib/utils";

export type DateFieldMode = "date" | "time" | "datetime";

export interface DateFieldLabels {
  /** The app's language (`NEXT_LOCALE`), for month and day names; not the browser's. */
  locale: string;
  today: string;
  clear: string;
  now: string;
  /** What the field says before anything is chosen, per mode. */
  empty: Record<DateFieldMode, string>;
  prevMonth: string;
  nextMonth: string;
  hour: string;
  minute: string;
}

const pad = (n: number) => String(n).padStart(2, "0");
const toISO = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

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

const smallSelect =
  "min-h-11 rounded-md border-[1.5px] border-input bg-card px-2 text-base text-foreground focus-visible:border-primary";

/**
 * Styled date / time / datetime picker matching the app UI, replacing the
 * browser's native (unstylable) controls. Emits the same value shapes as the
 * native inputs, `YYYY-MM-DD` (date), `HH:MM` (time), `YYYY-MM-DDTHH:MM`
 * (datetime), so form handling is unchanged. Locale-aware names; Monday-first.
 *
 * A disclosure below the field, not a modal: Escape and a press outside close
 * it, and Escape returns the focus to the field. Every target is 44 px.
 */
export function DateField({
  id,
  mode,
  value,
  onChange,
  disabled,
  invalid,
  placeholder,
  describedBy,
  labels,
}: {
  id?: string;
  mode: DateFieldMode;
  value?: string;
  onChange: (value: string | undefined) => void;
  disabled?: boolean;
  invalid?: boolean;
  placeholder?: string;
  describedBy?: string;
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
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = `${id ?? "date"}-picker`;
  const locale = labels.locale;

  useDismiss(open, ref, (reason) => {
    setOpen(false);
    if (reason === "escape") triggerRef.current?.focus();
  });

  const weekdays = useMemo(() => {
    const fmt = new Intl.DateTimeFormat(locale, { weekday: "short" });
    return Array.from({ length: 7 }, (_, i) => fmt.format(new Date(2024, 0, 1 + i)));
  }, [locale]);

  const monthLabel = useMemo(
    () => new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(view),
    [locale, view],
  );
  const dayName = useMemo(() => new Intl.DateTimeFormat(locale, { dateStyle: "full" }), [locale]);

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
    if (mode === "date") {
      setOpen(false); // datetime stays open to set the time
      triggerRef.current?.focus();
    }
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
  const TriggerIcon = mode === "time" ? Clock : CalendarBlank;

  return (
    <div ref={ref} className="relative">
      <button
        ref={triggerRef}
        type="button"
        id={id}
        disabled={disabled}
        aria-expanded={open}
        aria-controls={panelId}
        aria-describedby={describedBy}
        aria-invalid={invalid || undefined}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex min-h-11 w-full items-center justify-between gap-3 rounded-md border-[1.5px] bg-card px-3 py-2 text-start text-base transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50",
          invalid ? "border-danger" : "border-input",
          displayValue ? "text-foreground" : "text-muted-foreground",
        )}
      >
        <span>{displayValue || placeholder || labels.empty[mode]}</span>
        <TriggerIcon className="h-5 w-5 shrink-0 text-muted-foreground" />
      </button>

      <div
        id={panelId}
        hidden={!open}
        className="absolute inset-s-0 z-50 mt-1.5 w-[min(22rem,calc(100vw-2rem))] rounded-lg border border-border bg-card p-3 text-card-foreground shadow-[var(--shadow-card-hover)]"
      >
        {showCalendar && (
          <>
            <div className="mb-2 flex items-center justify-between">
              <button
                type="button"
                aria-label={labels.prevMonth}
                onClick={() => setView((v) => new Date(v.getFullYear(), v.getMonth() - 1, 1))}
                className="flex h-11 w-11 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <CaretLeft className="h-5 w-5" />
              </button>
              <span aria-live="polite" className="font-semibold text-foreground capitalize">
                {monthLabel}
              </span>
              <button
                type="button"
                aria-label={labels.nextMonth}
                onClick={() => setView((v) => new Date(v.getFullYear(), v.getMonth() + 1, 1))}
                className="flex h-11 w-11 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <CaretRight className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-0.5">
              {weekdays.map((w) => (
                <div
                  key={w}
                  aria-hidden
                  className="py-1 text-center text-small font-semibold text-muted-foreground"
                >
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
                    aria-label={dayName.format(d)}
                    aria-pressed={isSelected}
                    aria-current={isToday ? "date" : undefined}
                    className={cn(
                      "flex min-h-11 items-center justify-center rounded-md text-base tabular-nums transition-colors",
                      isSelected
                        ? "bg-primary font-semibold text-primary-foreground"
                        : inMonth
                          ? "text-foreground hover:bg-muted"
                          : "text-muted-foreground hover:bg-muted",
                      isToday && !isSelected && "ring-[1.5px] ring-primary ring-inset",
                    )}
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
            className={cn(
              "flex items-center justify-center gap-2",
              showCalendar && "mt-2 border-t border-border pt-3",
            )}
          >
            <Clock className="h-5 w-5 text-muted-foreground" />
            <select
              aria-label={labels.hour}
              value={parsed.h ?? ""}
              onChange={(e) => setTime(Number(e.target.value), parsed.m ?? 0)}
              className={smallSelect}
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
            <span aria-hidden className="text-muted-foreground">
              :
            </span>
            <select
              aria-label={labels.minute}
              value={parsed.m ?? ""}
              onChange={(e) => setTime(parsed.h ?? 0, Number(e.target.value))}
              className={smallSelect}
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

        <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
          <button
            type="button"
            onClick={() => {
              onChange(undefined);
              setOpen(false);
              triggerRef.current?.focus();
            }}
            className="inline-flex min-h-11 items-center rounded-md px-2 font-semibold text-muted-foreground transition-colors hover:text-danger"
          >
            {labels.clear}
          </button>
          <button
            type="button"
            onClick={() => {
              const now = new Date();
              setView(new Date(now.getFullYear(), now.getMonth(), 1));
              emit(now, now.getHours(), now.getMinutes());
              if (mode === "date") {
                setOpen(false);
                triggerRef.current?.focus();
              }
            }}
            className="inline-flex min-h-11 items-center rounded-md px-2 font-semibold text-primary underline-offset-4 hover:underline"
          >
            {mode === "date" ? labels.today : labels.now}
          </button>
        </div>
      </div>
    </div>
  );
}
