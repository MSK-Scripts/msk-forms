"use client";

import { useId, type ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * A native checkbox with its label on a 44 px row, and an optional hint tied
 * to it through `aria-describedby`. For a yes/no setting of its own and for
 * the options of a group (a fieldset whose legend asks the question). The
 * label is regular text; the question above a group is the legend. The row
 * is only as wide as its label, so a click beside it toggles nothing.
 */
export function Checkbox({
  label,
  hint,
  checked,
  onChange,
  disabled,
  invalid,
  describedBy,
  id: givenId,
  className,
}: {
  label: ReactNode;
  hint?: ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  /** Sets `aria-invalid`, for a box that has to be ticked to go on. */
  invalid?: boolean;
  /** Id of a message elsewhere on the page that belongs to the box, such as its error. */
  describedBy?: string;
  id?: string;
  className?: string;
}) {
  const ownId = useId();
  const id = givenId ?? ownId;
  const hintId = `${id}-hint`;
  const described = [hint ? hintId : null, describedBy].filter(Boolean).join(" ") || undefined;
  return (
    <div className={cn("grid gap-0.5", className)}>
      <label htmlFor={id} className="flex min-h-11 w-fit max-w-full cursor-pointer items-start gap-3 py-2">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          aria-invalid={invalid || undefined}
          aria-describedby={described}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-1 h-5 w-5 shrink-0 cursor-pointer accent-primary disabled:cursor-not-allowed"
        />
        <span className="max-w-[65ch]">{label}</span>
      </label>
      {hint && (
        <p id={hintId} className="max-w-[65ch] ps-8 text-small text-muted-foreground">
          {hint}
        </p>
      )}
    </div>
  );
}
