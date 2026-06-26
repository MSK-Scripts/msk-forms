import type { SelectHTMLAttributes } from "react";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  /** Optional disabled placeholder shown when no value is selected. */
  placeholder?: string;
  invalid?: boolean;
}

// text-base on mobile (≥16px) prevents iOS Safari from auto-zooming on focus.
const base =
  "flex h-10 w-full rounded-md border bg-background px-3 py-2 text-base sm:text-sm text-foreground " +
  "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring " +
  "focus-visible:ring-offset-2 focus-visible:ring-offset-background " +
  "disabled:cursor-not-allowed disabled:opacity-50";

export function Select({
  options,
  placeholder,
  invalid,
  className = "",
  ...props
}: SelectProps) {
  return (
    <select
      className={`${base} ${invalid ? "border-destructive" : "border-input"} ${className}`}
      aria-invalid={invalid || undefined}
      {...props}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
