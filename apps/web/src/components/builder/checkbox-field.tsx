"use client";

import { useId, type ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * A native checkbox with its label on a 44 px row and an optional hint tied
 * to it through aria-describedby. The builder's yes/no settings use it.
 */
export function CheckboxField({
  label,
  hint,
  checked,
  onChange,
  disabled,
  className,
}: {
  label: ReactNode;
  hint?: ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}) {
  const id = useId();
  const hintId = `${id}-hint`;
  return (
    <div className={cn("grid gap-0.5", className)}>
      <label htmlFor={id} className="flex min-h-11 cursor-pointer items-start gap-3 py-2">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          aria-describedby={hint ? hintId : undefined}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-1 h-5 w-5 shrink-0 cursor-pointer accent-primary disabled:cursor-not-allowed"
        />
        <span className="font-semibold">{label}</span>
      </label>
      {hint && (
        <p id={hintId} className="max-w-[65ch] ps-8 text-small text-muted-foreground">
          {hint}
        </p>
      )}
    </div>
  );
}
