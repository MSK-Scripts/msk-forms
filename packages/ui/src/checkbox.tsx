import type { InputHTMLAttributes, ReactNode } from "react";

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  /** Inline label rendered next to the box (e.g. a consent statement). */
  label: ReactNode;
}

/** Single checkbox with an inline label, e.g. consent. The whole row is the 44 px target. */
export function Checkbox({ label, className = "", id, ...props }: CheckboxProps) {
  return (
    <label htmlFor={id} className="flex min-h-11 cursor-pointer items-center gap-3 text-foreground">
      <input id={id} type="checkbox" className={`h-5 w-5 shrink-0 accent-primary ${className}`} {...props} />
      <span>{label}</span>
    </label>
  );
}
