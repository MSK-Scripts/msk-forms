import type { CSSProperties } from "react";

export interface ColorDotProps {
  /** The dot in the light theme. Without it the dot is the muted text colour. */
  color?: string;
  /** The dot in the dark theme; the light one when not given. */
  darkColor?: string;
  /** `sm` beside small text and in badges, `md` beside a heading. */
  size?: "sm" | "md";
}

/**
 * A guild's own colour (a status, a category) as a dot beside its word. The
 * app hands over one readable colour per theme (`dotColors` in
 * apps/web/src/lib/color-dot.ts: 3:1 on every surface of the theme), and the
 * dot switches with the theme. A thin edge in the text colour keeps it a
 * visible shape on any ground. Decorative: the word next to it says what it
 * is.
 */
export function ColorDot({ color, darkColor, size = "sm" }: ColorDotProps) {
  const style = color ? ({ "--dot": color, "--dot-dark": darkColor ?? color } as CSSProperties) : undefined;
  return (
    <span
      aria-hidden="true"
      style={style}
      className={`${size === "md" ? "h-3 w-3" : "h-2.5 w-2.5"} shrink-0 rounded-full bg-[var(--dot,hsl(var(--muted-foreground)))] shadow-[0_0_0_1px_hsl(var(--foreground)/0.35)] dark:bg-[var(--dot-dark,hsl(var(--muted-foreground)))]`}
    />
  );
}

export interface SubmissionStatusBadgeProps extends Omit<ColorDotProps, "size"> {
  label: string;
}

/**
 * A submission status in a guild's own colour: the colour as a dot, the word
 * in the text colour. A guild picks any colour for its statuses, and as text
 * many of them would not reach 4.5:1 on the ground; the dot carries the
 * colour and the word stays readable in both themes, so the status is never
 * told by colour alone.
 *
 * Not the dashboard kit's `StatusBadge`: that one shows the state of a system
 * object (live, draft, failed) in one of the fixed status tones with a sign.
 * This one shows a customer-defined status in the customer's colour.
 */
export function SubmissionStatusBadge({ label, color, darkColor }: SubmissionStatusBadgeProps) {
  return (
    <span className="inline-flex w-fit items-center gap-2 rounded-sm border border-input px-2.5 py-1 text-small font-semibold leading-tight text-foreground">
      <ColorDot color={color} darkColor={darkColor} />
      {label}
    </span>
  );
}
