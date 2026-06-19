import type { ReactNode } from "react";

export interface FieldProps {
  /** Stable id linking the label to the control. */
  htmlFor?: string;
  label?: string;
  /** Renders a subtle required marker next to the label. */
  required?: boolean;
  /** Helper text shown below the label. */
  hint?: string;
  /** Validation error; when set it replaces the hint and reddens the marker. */
  error?: string;
  children: ReactNode;
}

/**
 * Shared layout wrapper for form controls: label, required marker, hint and
 * error. Controls render as `children` so this composes with any input.
 */
export function Field({ htmlFor, label, required, hint, error, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={htmlFor}
          className="font-mono text-xs uppercase tracking-widest text-text-secondary"
        >
          {label}
          {required && <span className="ml-1 text-accent">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="font-mono text-xs text-red-400">{error}</p>
      ) : hint ? (
        <p className="text-xs text-text-muted">{hint}</p>
      ) : null}
    </div>
  );
}
