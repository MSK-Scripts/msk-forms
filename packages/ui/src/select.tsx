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

const base =
  "w-full rounded-sm border bg-bg-input px-3 py-2 text-sm text-text-primary " +
  "outline-none transition-colors focus:border-border-accent " +
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
      className={`${base} ${invalid ? "border-red-500/50" : "border-border"} ${className}`}
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
