import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import { Minus, TrendDown, TrendUp } from "@/components/icons";
import { cn } from "@/lib/utils";

export interface StatTrend {
  direction: "up" | "down" | "flat";
  /**
   * What the change means, not where it points: more rejected submissions
   * are bad news although the arrow points up.
   */
  meaning: "good" | "bad" | "neutral";
  /** The change in words, "+12 % vs. last 30 days". The arrow is not enough. */
  label: string;
}

const MEANING = {
  good: "text-success",
  bad: "text-danger",
  neutral: "text-muted-foreground",
} as const;

const ARROW = { up: TrendUp, down: TrendDown, flat: Minus } as const;

/**
 * One tile, one statement. A trend only when the comparison says something,
 * and then with arrow, colour and words, never colour alone. With `href` the
 * whole tile leads to the page behind the number.
 */
export function StatTile({
  label,
  value,
  hint,
  trend,
  href,
  className,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  trend?: StatTrend;
  /** Path of the detail page. */
  href?: string;
  className?: string;
}) {
  const Arrow = trend ? ARROW[trend.direction] : null;
  const body = (
    <>
      <span className="text-label font-semibold uppercase tracking-[0.08em] text-muted-foreground">{label}</span>
      <span className="font-display text-[clamp(1.5rem,1.25rem+0.7vw,2.25rem)] font-bold leading-tight tabular-nums">
        {value}
      </span>
      {trend && Arrow && (
        <span className={cn("inline-flex items-center gap-1.5 text-small font-semibold", MEANING[trend.meaning])}>
          <Arrow className="h-4 w-4 shrink-0" weight="bold" />
          {trend.label}
        </span>
      )}
      {hint && <span className="text-small text-muted-foreground">{hint}</span>}
    </>
  );
  const tileClass = cn("flex min-h-28 min-w-0 flex-col gap-1 rounded-lg border border-border bg-card p-4", className);
  if (!href) return <div className={tileClass}>{body}</div>;
  return (
    <Link
      href={href as Route}
      prefetch={false}
      className={cn(tileClass, "transition-colors duration-150 hover:border-primary")}
    >
      {body}
    </Link>
  );
}

/**
 * Row of tiles. The tiles gain columns with the room the content column has
 * (container query) and do not shrink below a readable width.
 */
export function StatGrid({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("grid grid-cols-1 gap-3 @md:grid-cols-2 @5xl:grid-cols-4", className)}>{children}</div>;
}
