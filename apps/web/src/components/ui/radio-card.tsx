import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * A native radio button as a card: the input covers its whole label, so a tap
 * anywhere on the card chooses it, arrow keys move the choice and a screen
 * reader announces a radio group without any ARIA. The chosen card gets the
 * green border and the soft accent surface; focus shows on the card, and in
 * forced colours the choice keeps an outline of its own.
 */
export function RadioCard({
  name,
  value,
  checked,
  onChange,
  children,
  className,
}: {
  name: string;
  value: string;
  checked: boolean;
  onChange: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label
      className={cn(
        "relative grid min-h-11 cursor-pointer content-start gap-0.5 rounded-md border-[1.5px] border-input bg-card px-3.5 py-3 transition-colors duration-150",
        "hover:border-foreground",
        "has-[:checked]:border-primary has-[:checked]:bg-accent-soft has-[:checked]:shadow-[inset_0_0_0_1.5px_hsl(var(--primary))]",
        "has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring has-[:focus-visible]:outline-solid",
        "forced-colors:has-[:checked]:outline-[3px] forced-colors:has-[:checked]:outline-[color:Highlight] forced-colors:has-[:checked]:outline-solid",
        className,
      )}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="absolute inset-0 m-0 h-full w-full cursor-pointer opacity-0"
      />
      {children}
    </label>
  );
}
