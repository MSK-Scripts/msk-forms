"use client";

import { Star } from "@/components/icons";
import { cn } from "@/lib/utils";

/**
 * Rating-family input widgets (stars, 0–10 / emoji scale buttons, slider).
 * All emit a numeric value; bounds come from the shared `scaleBounds` helper so
 * the renderer, validation, and formatter stay in sync.
 */

interface BaseProps {
  value?: number;
  onChange: (value: number | undefined) => void;
  disabled?: boolean;
}

/**
 * Clickable star rating (1…max). Clicking the current value clears it. Toggle
 * buttons inside the field's fieldset: the pressed one is the rating, and
 * its name says the value and the scale.
 */
export function StarRating({ value, max, onChange, disabled }: BaseProps & { max: number }) {
  return (
    <div className="flex flex-wrap items-center gap-0.5">
      {Array.from({ length: max }, (_, i) => i + 1).map((n) => {
        const active = (value ?? 0) >= n;
        return (
          <button
            key={n}
            type="button"
            aria-pressed={value === n}
            aria-label={`${n} / ${max}`}
            disabled={disabled}
            onClick={() => onChange(value === n ? undefined : n)}
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-md transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50",
              active ? "text-primary" : "text-muted-foreground",
            )}
          >
            <Star className="h-7 w-7" weight={active ? "fill" : "regular"} />
          </button>
        );
      })}
    </div>
  );
}

/** Row of discrete value buttons (NPS 0–10, emoji 1–5). */
export function ScaleButtons({
  value,
  min,
  max,
  renderLabel,
  onChange,
  disabled,
}: BaseProps & { min: number; max: number; renderLabel?: (n: number) => string }) {
  const values = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  return (
    <div className="flex flex-wrap gap-1.5">
      {values.map((n) => {
        const active = value === n;
        return (
          <button
            key={n}
            type="button"
            aria-pressed={active}
            aria-label={`${n}`}
            disabled={disabled}
            onClick={() => onChange(active ? undefined : n)}
            className={cn(
              "flex min-h-11 min-w-11 items-center justify-center rounded-md border-[1.5px] px-2 text-base tabular-nums transition-colors disabled:cursor-not-allowed disabled:opacity-50",
              active
                ? "border-primary bg-accent-soft font-semibold text-primary"
                : "border-input text-foreground hover:border-foreground",
            )}
          >
            {renderLabel ? renderLabel(n) : n}
          </button>
        );
      })}
    </div>
  );
}

/** Range slider with the current value shown alongside. */
export function SliderInput({
  id,
  describedBy,
  value,
  min,
  max,
  step,
  onChange,
  disabled,
}: BaseProps & { id: string; describedBy?: string; min: number; max: number; step: number }) {
  const current = value ?? min;
  return (
    <div className="flex min-h-11 items-center gap-3">
      <input
        id={id}
        aria-describedby={describedBy}
        type="range"
        min={min}
        max={max}
        step={step}
        value={current}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-11 w-full cursor-pointer accent-primary disabled:cursor-not-allowed disabled:opacity-50"
      />
      <output htmlFor={id} className="w-12 shrink-0 text-end font-semibold tabular-nums text-foreground">
        {current}
      </output>
    </div>
  );
}
