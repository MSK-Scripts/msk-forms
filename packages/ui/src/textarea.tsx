import type { TextareaHTMLAttributes } from "react";

import { fieldClass } from "./input";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export function Textarea({ invalid, className = "", ...props }: TextareaProps) {
  return (
    <textarea
      className={`${fieldClass} min-h-28 resize-y ${invalid ? "border-danger" : "border-input"} ${className}`}
      aria-invalid={invalid || undefined}
      {...props}
    />
  );
}
