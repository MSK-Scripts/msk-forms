import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Heading of a public page: the form's title and its description. */
export function PublicHead({
  kicker,
  title,
  description,
  children,
}: {
  kicker?: string;
  title: string;
  description?: string | null;
  /** Below the description, e.g. the status of a submission. */
  children?: ReactNode;
}) {
  return (
    <header className="grid gap-3">
      {kicker && <span className="kicker">{kicker}</span>}
      <h1 className="text-h2 font-bold tracking-[-0.015em] text-balance">{title}</h1>
      {description && <p className="max-w-[60ch] text-lead whitespace-pre-line text-muted-foreground">{description}</p>}
      {children}
    </header>
  );
}

/** The card a form sits on: a task of its own, so a card and not just spacing. */
export function PublicCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card p-[clamp(1.25rem,0.75rem+2vw,2.5rem)] text-card-foreground shadow-[var(--shadow-card)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** A section of a public page, set apart by a hairline instead of a box. */
export function PublicSection({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="grid gap-3 border-t border-border pt-[var(--space-stack)]">
      <h2 id={id} className="font-display text-h3 font-[650]">
        {title}
      </h2>
      {children}
    </section>
  );
}
