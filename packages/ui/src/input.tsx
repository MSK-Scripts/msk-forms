import type { InputHTMLAttributes } from "react";

/**
 * The field look of the shop: 44 px or more, a 1.5 px border that reaches
 * 3:1 on card and ground, text of 16 px or more (no zoom on iOS), the global
 * focus outline, and a red border once the field is invalid.
 */
export const fieldClass =
  "w-full min-h-11 rounded-md border-[1.5px] bg-card px-3 py-2 text-base text-foreground " +
  "placeholder:text-muted-foreground transition-colors duration-150 focus-visible:border-primary " +
  "disabled:cursor-not-allowed disabled:opacity-50";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Reddens the border and sets aria-invalid. */
  invalid?: boolean;
}

export function Input({ invalid, className = "", ...props }: InputProps) {
  return (
    <input
      className={`${fieldClass} ${invalid ? "border-danger" : "border-input"} ${className}`}
      aria-invalid={invalid || undefined}
      {...props}
    />
  );
}
