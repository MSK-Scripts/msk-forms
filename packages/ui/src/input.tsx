import type { InputHTMLAttributes } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Reddens the border to signal a validation error. */
  invalid?: boolean;
}

// text-base on mobile (≥16px) prevents iOS Safari from auto-zooming on focus;
// drops back to text-sm from sm: up.
const base =
  "flex h-10 w-full rounded-md border bg-background px-3 py-2 text-base sm:text-sm text-foreground " +
  "placeholder:text-muted-foreground transition-colors focus-visible:outline-none focus-visible:border-primary " +
  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background " +
  "disabled:cursor-not-allowed disabled:opacity-50";

export function Input({ invalid, className = "", ...props }: InputProps) {
  return (
    <input
      className={`${base} ${invalid ? "border-destructive" : "border-input"} ${className}`}
      aria-invalid={invalid || undefined}
      {...props}
    />
  );
}
