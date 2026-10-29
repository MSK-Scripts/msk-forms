import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "ghost";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

// After the shop's Button: the fill in the accent with its label, a second
// action outlined; 44 px minimum, the label may wrap. Focus uses the global
// outline of globals.css, in the customer's ring colour on a public page.
const styles: Record<Variant, string> = {
  primary: "bg-primary text-primary-foreground hover:bg-primary-hover",
  ghost: "border-[1.5px] border-input bg-transparent text-foreground hover:border-foreground",
};

export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4.5 py-2 text-center text-base leading-tight font-semibold transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50 ${styles[variant]} ${className}`}
      {...props}
    />
  );
}
