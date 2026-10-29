import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/lib/utils";

/**
 * A tag: a category, a plan, a feature. `default` is the shop's tag, green
 * text on the soft green surface. Not for states of a system object ("Live",
 * "Rejected"); those are `StatusBadge` from components/dashboard-kit, which
 * always pairs the word with a sign.
 */
const badgeVariants = cva(
  // Small radius, not a pill: nothing in the system is a pill.
  "inline-flex items-center gap-1.5 rounded-sm border px-2.5 py-0.5 text-[0.6875rem] font-bold uppercase tracking-wider",
  {
    variants: {
      variant: {
        default: "border-transparent bg-accent-soft text-primary",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        outline: "border-input text-foreground",
        muted: "border-transparent bg-muted text-muted-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { badgeVariants };
