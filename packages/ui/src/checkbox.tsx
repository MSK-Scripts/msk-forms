import type { InputHTMLAttributes, ReactNode } from "react";

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  /** Inline label rendered next to the box (e.g. a consent statement). */
  label: ReactNode;
}

/** Single checkbox with an inline label — e.g. consent / "I agree" fields. */
export function Checkbox({ label, className = "", id, ...props }: CheckboxProps) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-start gap-2.5 text-sm text-text-primary"
    >
      <input
        id={id}
        type="checkbox"
        className={`mt-0.5 h-4 w-4 shrink-0 accent-accent ${className}`}
        {...props}
      />
      <span className="text-text-secondary">{label}</span>
    </label>
  );
}
