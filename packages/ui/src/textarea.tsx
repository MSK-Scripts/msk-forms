import type { TextareaHTMLAttributes } from "react";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

const base =
  "w-full rounded-sm border bg-bg-input px-3 py-2 text-sm text-text-primary " +
  "placeholder:text-text-muted outline-none transition-colors resize-y min-h-24 " +
  "focus:border-border-accent disabled:cursor-not-allowed disabled:opacity-50";

export function Textarea({ invalid, className = "", ...props }: TextareaProps) {
  return (
    <textarea
      className={`${base} ${invalid ? "border-red-500/50" : "border-border"} ${className}`}
      aria-invalid={invalid || undefined}
      {...props}
    />
  );
}
