import type { ReactNode } from "react";

import { Lock, MagnifyingGlass, Sparkle, WarningCircle, type IconComponent } from "@/components/icons";
import { cn } from "@/lib/utils";

/**
 * What a list or a page shows when there is nothing to show. Never blank: a
 * short line and exactly one next step. The kinds are kept apart because the
 * next step differs: a first use invites, no results suggests widening the
 * filter, an error names the remedy, and an unavailable area says where to go
 * instead.
 */
export type EmptyKind = "first-use" | "no-results" | "error" | "unavailable";

const ICON: Record<EmptyKind, IconComponent> = {
  "first-use": Sparkle,
  "no-results": MagnifyingGlass,
  error: WarningCircle,
  unavailable: Lock,
};

export function EmptyState({
  kind,
  title,
  children,
  action,
  className,
  headingLevel = "p",
}: {
  kind: EmptyKind;
  title: ReactNode;
  children?: ReactNode;
  /** The one next step. */
  action?: ReactNode;
  className?: string;
  /** `h1` when the state is the whole page, a paragraph inside a list. */
  headingLevel?: "h1" | "h2" | "p";
}) {
  const Icon = ICON[kind];
  const Heading = headingLevel;
  return (
    <div
      role={kind === "error" ? "alert" : undefined}
      className={cn("flex flex-col items-center gap-2 px-4 py-10 text-center", className)}
    >
      <Icon className={cn("h-8 w-8", kind === "error" ? "text-danger" : "text-muted-foreground")} />
      <Heading className="font-display text-h3 font-[650]">{title}</Heading>
      {children && <div className="max-w-[55ch] text-muted-foreground">{children}</div>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
