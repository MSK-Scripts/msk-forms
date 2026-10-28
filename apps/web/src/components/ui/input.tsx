import { forwardRef, type InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

/**
 * Shared look of text fields, textareas and selects. The border reaches 3:1
 * against card and ground (WCAG 1.4.11), focus uses the global 3 px outline,
 * and a field shows a red border once it carries aria-invalid. The text is
 * 16 px or more, so iOS does not zoom in when the field gets focus.
 */
export const fieldClassName = cn(
  "w-full min-h-11 rounded-md border-[1.5px] border-input bg-card px-3 py-2",
  "text-base text-foreground placeholder:text-muted-foreground",
  "transition-colors duration-150 focus-visible:border-primary",
  "aria-invalid:border-danger",
  "disabled:cursor-not-allowed disabled:opacity-50",
);

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className, type = "text", ...props },
  ref,
) {
  return <input ref={ref} type={type} className={cn(fieldClassName, className)} {...props} />;
});
