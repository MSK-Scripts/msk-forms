import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface Fact {
  title: string;
  text: ReactNode;
}

/**
 * Items with a short title and a sentence or two, grouped by spacing and a
 * hairline rather than by boxes, after the shop's FactList. Replaces rows of
 * equal icon cards, which are on the exclusion list.
 *
 * The columns follow the surrounding container: one on a phone, two from
 * 48rem, three from 72rem when `wide` is set. The text keeps its measure in
 * every column count.
 */
export function FactList({
  items,
  wide = false,
  numbered = false,
  className,
}: {
  items: Fact[];
  /** Allow a third column. */
  wide?: boolean;
  /** Number the items, for steps that happen in this order. */
  numbered?: boolean;
  className?: string;
}) {
  const List = numbered ? "ol" : "ul";
  return (
    <List
      className={cn(
        "grid gap-x-[clamp(2rem,4cqi,5rem)] @3xl:grid-cols-2",
        wide && "@6xl:grid-cols-3",
        className,
      )}
    >
      {items.map((item, i) => (
        <li key={item.title} className="grid content-start gap-1.5 border-t border-border py-5">
          <h3 className="flex items-baseline gap-2.5 font-display text-lead font-[650]">
            {numbered && (
              <span className="tabular-nums text-primary">
                {i + 1}
                <span className="sr-only">.</span>
              </span>
            )}
            {item.title}
          </h3>
          <div className="max-w-[34rem] text-muted-foreground">{item.text}</div>
        </li>
      ))}
    </List>
  );
}
