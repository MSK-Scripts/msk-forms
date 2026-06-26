import type { HTMLAttributes } from "react";

export type CardProps = HTMLAttributes<HTMLDivElement>;

/** Panel container in the MSK dark style — the base surface for forms/sections. */
export function Card({ className = "", ...props }: CardProps) {
  return (
    <div
      className={`rounded-lg border border-border bg-card shadow-card transition-shadow ${className}`}
      {...props}
    />
  );
}
