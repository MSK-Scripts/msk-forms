import type { ReactNode } from "react";

/** Ids of a field's hint and error, so the control can point at them. */
export function fieldHintId(id: string): string {
  return `${id}-hint`;
}
export function fieldErrorId(id: string): string {
  return `${id}-error`;
}

/** `aria-describedby` for a control: its hint or its error, whichever is shown. */
export function fieldDescribedBy(id: string, { hint, error }: { hint?: string; error?: string }): string | undefined {
  // The error replaces the hint on screen, so it replaces it here too.
  if (error) return fieldErrorId(id);
  return hint ? fieldHintId(id) : undefined;
}

export interface FieldProps {
  /** Id of the control the label points at, and the base of the hint and error ids. */
  htmlFor?: string;
  label?: string;
  /** Renders a required marker next to the label (hidden from screen readers; the control says it). */
  required?: boolean;
  /** Helper text shown below the label. */
  hint?: string;
  /** Validation error; when set it replaces the hint. */
  error?: string;
  /**
   * A group of controls (radios, checkboxes, a scale): a fieldset whose
   * legend is the label, described by the hint and error. Single controls
   * take `fieldDescribedBy` themselves.
   */
  group?: boolean;
  /** Sign in front of the error, so it is never told by colour alone. */
  errorIcon?: ReactNode;
  children: ReactNode;
}

/**
 * Label, hint, control and error in one column, after the shop's form
 * fields: the label above the control in the text colour, the hint below it,
 * the error with a sign in the danger colour. The error keeps what was typed.
 */
export function Field({ htmlFor, label, required, hint, error, group, errorIcon, children }: FieldProps) {
  const id = htmlFor ?? "";
  const marker = required ? (
    <span aria-hidden="true" className="text-danger">
      {" "}
      *
    </span>
  ) : null;
  const description = error ? (
    <p id={fieldErrorId(id)} className="flex items-start gap-1.5 text-small font-semibold text-danger">
      {errorIcon}
      {error}
    </p>
  ) : hint ? (
    <p id={fieldHintId(id)} className="text-small text-muted-foreground">
      {hint}
    </p>
  ) : null;

  if (group) {
    return (
      <fieldset className="m-0 grid min-w-0 gap-2 border-0 p-0" aria-describedby={fieldDescribedBy(id, { hint, error })}>
        {label && (
          <legend className="mb-2 p-0 font-semibold text-foreground">
            {label}
            {marker}
          </legend>
        )}
        {children}
        {description}
      </fieldset>
    );
  }

  return (
    <div className="grid min-w-0 gap-2">
      {label && (
        <label htmlFor={htmlFor} className="font-semibold text-foreground">
          {label}
          {marker}
        </label>
      )}
      {children}
      {description}
    </div>
  );
}
