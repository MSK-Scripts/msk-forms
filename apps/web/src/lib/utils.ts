import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * The type scale of app/globals.css (`--text-display` to `--text-label`).
 *
 * tailwind-merge only knows Tailwind's own sizes and takes any other `text-*`
 * for a colour, so `cn("text-primary-foreground", "text-lead")` would drop
 * the colour. The shop lost the white label of its large primary button that
 * way; telling tailwind-merge the sizes keeps both.
 */
const FONT_SIZES = ["display", "h2", "h3", "product", "lead", "body", "small", "label"];

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: FONT_SIZES }],
    },
  },
});

/** Merge conditional class names and resolve Tailwind conflicts. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
