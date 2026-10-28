import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Every button and button-styled link (`asChild`), after the shop's Button.
 *
 * One main action per area in green (`primary`), the second one outlined
 * (`outline`), the third a text link (`link`). `ghost` for quiet icon and
 * toolbar actions, `secondary` beside a primary where both are a real
 * choice, `danger` only to confirm a destructive action, `band` and
 * `band-outline` on the anthracite band. Focus uses the global 3 px outline
 * from globals.css.
 *
 * `default` and `destructive` (variants) and `default` (size) are the names
 * of the previous shadcn button, kept so existing pages keep working; new
 * code uses `primary`, `danger` and `md`.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center text-center leading-tight font-semibold transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary-hover",
        default: "bg-primary text-primary-foreground hover:bg-primary-hover",
        secondary: "bg-secondary text-secondary-foreground hover:bg-muted",
        outline: "border-[1.5px] border-input bg-transparent text-foreground hover:border-foreground",
        ghost: "bg-transparent text-foreground hover:bg-muted",
        link: "bg-transparent text-primary hover:underline underline-offset-4 p-0 min-h-0 h-auto",
        discord: "bg-discord text-white hover:brightness-110",
        danger: "bg-danger text-danger-foreground hover:brightness-95",
        destructive: "bg-danger text-danger-foreground hover:brightness-95",
        // On the anthracite band the page green measures about 2.3:1, so the
        // band has its own green and the outline its own light border.
        band: "bg-band-accent text-band-accent-foreground hover:bg-band-foreground hover:text-band",
        "band-outline":
          "border-[1.5px] border-band-muted bg-transparent text-band-foreground hover:border-band-foreground",
      },
      // Heights are minimums, so a long label wraps instead of being cut. md
      // and lg reach the 44 px touch target, sm (36 px) is for tables and
      // dense toolbars, icon keeps 40 px visible plus the 44 px tap-target.
      size: {
        sm: "min-h-9 px-3.5 py-1.5 text-sm gap-1.5 rounded-md",
        md: "min-h-11 px-4.5 py-2 text-base gap-2 rounded-md",
        default: "min-h-11 px-4.5 py-2 text-base gap-2 rounded-md",
        lg: "min-h-12 px-6 py-2.5 text-lead gap-2 rounded-md",
        icon: "h-10 w-10 rounded-md tap-target",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size }), className)} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
