import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "ghost";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const styles: Record<Variant, string> = {
  primary:
    "bg-accent text-bg font-medium hover:opacity-90 border border-transparent",
  ghost:
    "bg-bg-input text-text-primary border border-border hover:border-border-accent",
};

export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`rounded-sm px-4 py-2 font-mono text-sm uppercase tracking-wide transition ${styles[variant]} ${className}`}
      {...props}
    />
  );
}
