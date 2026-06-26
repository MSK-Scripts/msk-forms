import { IconChevronRight } from "@tabler/icons-react";
import Link from "next/link";
import type { Route } from "next";

/**
 * Shared layout for the legal pages (imprint / privacy / terms). Renders a
 * breadcrumb and the pre-rendered Markdown HTML inside the `.legal-content`
 * styled article. Style mirrors the msk-shop legal pages.
 */
export function LegalContent({
  html,
  breadcrumb,
  href,
  homeLabel,
}: {
  html: string;
  breadcrumb: string;
  // Plain string: these routes aren't in the typedRoutes union at typecheck
  // time (generated during build), so we cast at the <Link> below.
  href: string;
  homeLabel: string;
}) {
  return (
    <main className="pwa-safe-x mx-auto max-w-3xl py-10 md:py-14">
      <nav
        aria-label="Breadcrumb"
        className="mb-8 flex items-center gap-1.5 text-xs text-muted-foreground"
      >
        <Link href="/" className="transition-colors hover:text-foreground">
          {homeLabel}
        </Link>
        <IconChevronRight className="h-3 w-3" />
        <Link href={href as Route} className="text-foreground transition-colors hover:underline">
          {breadcrumb}
        </Link>
      </nav>

      <article className="legal-content" dangerouslySetInnerHTML={{ __html: html }} />
    </main>
  );
}
