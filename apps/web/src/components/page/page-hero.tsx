import type { ReactNode } from "react";

import { CaretRight } from "@/components/icons";
import { cn } from "@/lib/utils";

export interface Crumb {
  label: string;
  /** Address; the last crumb, the page itself, has none. */
  href?: string;
}

/**
 * The head of a marketing page on the anthracite band, after the shop's
 * PageHero: breadcrumb, kicker, the heading, a lead, the actions. From
 * 1280 px an aside stands beside the heading.
 *
 * Heading and lead keep their measure on UWQHD: the heading at 20
 * characters of display size, the lead at 46.
 */
export function PageHero({
  id,
  kicker,
  title,
  lead,
  actions,
  aside,
  crumbs,
  breadcrumbLabel,
  children,
}: {
  /** Id of the h1, which names the section. */
  id: string;
  kicker?: string;
  title: ReactNode;
  lead?: ReactNode;
  actions?: ReactNode;
  aside?: ReactNode;
  crumbs?: Crumb[];
  breadcrumbLabel?: string;
  /** Below the actions: a proof line. */
  children?: ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="surface-band">
      <div
        className={cn(
          "container-page grid grid-cols-[minmax(0,1fr)] gap-[var(--space-stack)] py-[clamp(2.5rem,1.5rem+4vw,9rem)]",
          aside &&
            "min-[1280px]:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] min-[1280px]:items-center min-[1280px]:gap-x-[clamp(3rem,5vw,10rem)]",
        )}
      >
        <div className="grid min-w-0 content-start gap-[clamp(1rem,0.5rem+1vw,2rem)]">
          {crumbs && crumbs.length > 0 && (
            <nav aria-label={breadcrumbLabel} className="text-small text-band-muted">
              <ol className="flex flex-wrap items-center gap-x-1.5">
                {crumbs.map((c, i) => (
                  <li key={c.label} className="flex items-center gap-x-1.5">
                    {i > 0 && <CaretRight className="h-3 w-3" />}
                    {c.href ? (
                      <a
                        href={c.href}
                        className="inline-flex min-h-11 items-center underline-offset-4 hover:text-band-foreground hover:underline"
                      >
                        {c.label}
                      </a>
                    ) : (
                      <span aria-current="page" className="inline-flex min-h-11 items-center text-band-foreground">
                        {c.label}
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          )}
          <div className="grid gap-2.5">
            {kicker && <span className="kicker">{kicker}</span>}
            <h1 id={id} className="max-w-[20ch] text-display font-[750] tracking-[-0.02em] text-balance">
              {title}
            </h1>
          </div>
          {lead && <p className="max-w-[46ch] text-lead text-band-muted">{lead}</p>}
          {actions && <div className="flex flex-wrap items-center gap-x-5 gap-y-3">{actions}</div>}
          {children}
        </div>
        {aside && <div className="min-w-0">{aside}</div>}
      </div>
    </section>
  );
}

/** A brand word in the heading, in the band green. */
export function Accent({ children }: { children: ReactNode }) {
  return <em className="not-italic text-band-accent">{children}</em>;
}
