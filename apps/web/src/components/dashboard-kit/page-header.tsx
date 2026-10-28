import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import { ArrowLeft } from "@/components/icons";

export interface Breadcrumb {
  label: string;
  /** Path in the app. The last crumb is the current page and gets none. */
  href?: string;
}

/**
 * Head of a dashboard page: the title, at most one primary action, a status
 * badge when the page has a state, and a way back. The head is for the
 * page's own actions, not for navigation; that is the sidebar's job.
 * Breadcrumbs show the hierarchy below the sidebar level; the last one is the
 * current page and no link.
 */
export function PageHeader({
  title,
  description,
  badge,
  action,
  back,
  breadcrumbs,
  breadcrumbLabel,
}: {
  title: ReactNode;
  description?: ReactNode;
  badge?: ReactNode;
  /** The one primary action of the page. */
  action?: ReactNode;
  back?: { href: string; label: string };
  breadcrumbs?: Breadcrumb[];
  /** Name of the breadcrumb landmark, `kit.breadcrumb` of the dictionary. */
  breadcrumbLabel?: string;
}) {
  return (
    <div className="mb-[var(--app-gutter-y)] grid gap-3 border-b border-border pb-5">
      {breadcrumbs && breadcrumbs.length > 1 && (
        <nav aria-label={breadcrumbLabel}>
          <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-small text-muted-foreground">
            {breadcrumbs.map((crumb, i) => {
              const last = i === breadcrumbs.length - 1;
              return (
                <li key={`${crumb.label}-${i}`} className="flex items-center gap-2">
                  {last || !crumb.href ? (
                    <span aria-current={last ? "page" : undefined}>{crumb.label}</span>
                  ) : (
                    <Link href={crumb.href as Route} prefetch={false} className="text-primary hover:underline">
                      {crumb.label}
                    </Link>
                  )}
                  {!last && <span aria-hidden>/</span>}
                </li>
              );
            })}
          </ol>
        </nav>
      )}
      {back && (
        <Link
          href={back.href as Route}
          prefetch={false}
          className="inline-flex min-h-11 w-fit items-center gap-2 text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          {back.label}
        </Link>
      )}
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <div className="grid min-w-0 gap-1.5">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-[clamp(1.625rem,1.3rem+0.9vw,2.5rem)] font-bold leading-tight tracking-[-0.01em]">
              {title}
            </h1>
            {badge}
          </div>
          {description && <div className="max-w-[65ch] text-muted-foreground">{description}</div>}
        </div>
        {action && <div className="flex shrink-0 flex-wrap gap-3">{action}</div>}
      </div>
    </div>
  );
}
