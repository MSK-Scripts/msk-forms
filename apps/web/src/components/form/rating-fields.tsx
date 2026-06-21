"use client";

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

/** Clickable star rating (1…max). Clicking the current value clears it. */
export function StarRating({ value, max, onChange, disabled }: BaseProps & { max: number }) {
  return (
    <div className="flex items-center gap-1" role="radiogroup">
      {Array.from({ length: max }, (_, i) => i + 1).map((n) => {
        const active = (value ?? 0) >= n;
        return (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n}`}
            disabled={disabled}
            onClick={() => onChange(value === n ? undefined : n)}
            className={`text-2xl leading-none transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
              active ? "text-primary" : "text-muted-foreground/40 hover:text-muted-foreground"
            }`}
          >
            {active ? "★" : "☆"}
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
    <div className="flex flex-wrap gap-1.5" role="radiogroup">
      {values.map((n) => {
        const active = value === n;
        return (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={`${n}`}
            disabled={disabled}
            onClick={() => onChange(active ? undefined : n)}
            className={`flex h-10 min-w-10 items-center justify-center rounded-md border px-2 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
              active
                ? "border-primary bg-primary/10 text-foreground"
                : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
            }`}
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
  value,
  min,
  max,
  step,
  onChange,
  disabled,
}: BaseProps & { min: number; max: number; step: number }) {
  const current = value ?? min;
  return (
    <div className="flex items-center gap-3">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={current}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer accent-primary disabled:cursor-not-allowed disabled:opacity-50"
      />
      <span className="w-10 shrink-0 text-right text-sm tabular-nums text-foreground">{current}</span>
    </div>
  );
}
