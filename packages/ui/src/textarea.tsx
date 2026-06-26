import type { TextareaHTMLAttributes } from "react";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

// text-base on mobile (≥16px) prevents iOS Safari from auto-zooming on focus.
const base =
  "flex min-h-24 w-full resize-y rounded-md border bg-background px-3 py-2 text-base sm:text-sm text-foreground " +
  "placeholder:text-muted-foreground transition-colors focus-visible:outline-none " +
  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background " +
  "disabled:cursor-not-allowed disabled:opacity-50";

export function Textarea({ invalid, className = "", ...props }: TextareaProps) {
  return (
    <textarea
      className={`${base} ${invalid ? "border-destructive" : "border-input"} ${className}`}
      aria-invalid={invalid || undefined}
      {...props}
    />
  );
}
