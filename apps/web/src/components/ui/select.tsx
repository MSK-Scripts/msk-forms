import { forwardRef, type SelectHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

import { fieldClassName } from "./input";

/**
 * Native select with the field look. Native on purpose: keyboard, screen
 * readers and the phone's own picker work without any script.
 */
export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, ...props }, ref) {
    return <select ref={ref} className={cn(fieldClassName, "pr-8", className)} {...props} />;
  },
);
