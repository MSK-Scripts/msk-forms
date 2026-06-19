import type { InputHTMLAttributes } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Reddens the border to signal a validation error. */
  invalid?: boolean;
}

const base =
  "w-full rounded-sm border bg-bg-input px-3 py-2 text-sm text-text-primary " +
  "placeholder:text-text-muted outline-none transition-colors " +
  "focus:border-border-accent disabled:cursor-not-allowed disabled:opacity-50";

export function Input({ invalid, className = "", ...props }: InputProps) {
  return (
    <input
      className={`${base} ${invalid ? "border-red-500/50" : "border-border"} ${className}`}
      aria-invalid={invalid || undefined}
      {...props}
    />
  );
}
