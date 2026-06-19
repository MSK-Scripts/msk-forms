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
    <div className="flex flex-col gap-2">
      {label && (
        <label htmlFor={htmlFor} className="text-sm font-medium text-foreground">
          {label}
          {required && <span className="ml-1 text-primary">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
