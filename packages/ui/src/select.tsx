import type { SelectHTMLAttributes } from "react";

import { fieldClass } from "./input";

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

/** Native select with the field look: keyboard, screen readers and the phone's picker work as they are. */
export function Select({ options, placeholder, invalid, className = "", ...props }: SelectProps) {
  return (
    <select
      className={`${fieldClass} pr-8 ${invalid ? "border-danger" : "border-input"} ${className}`}
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
