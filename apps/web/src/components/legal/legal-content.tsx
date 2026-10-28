import { CaretRight } from "@/components/icons";

/**
 * Shared layout for the legal pages (imprint, privacy, terms), after the
 * shop's LegalContent: a breadcrumb and the pre-rendered Markdown in the
 * `.legal-content` article. No reading cap on the wrapper: the measure sits
 * on the text elements (82rem at 1.125rem, line height 1.75, in globals.css),
 * so the text starts at the column edge like the header and every other
 * page, and the tables keep the full column.
 */
export function LegalContent({
  html,
  breadcrumb,
  href,
  homeLabel,
  breadcrumbLabel,
}: {
  html: string;
  breadcrumb: string;
  href: string;
  homeLabel: string;
  breadcrumbLabel: string;
}) {
  return (
    <div className="container-page py-[clamp(2.5rem,1.5rem+2vw,3.5rem)]">
      <nav aria-label={breadcrumbLabel} className="mb-6 text-small text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-x-1.5">
          <li>
            <a
              href="/"
              className="inline-flex min-h-11 items-center underline-offset-4 hover:text-foreground hover:underline"
            >
              {homeLabel}
            </a>
          </li>
          <li className="flex items-center gap-x-1.5">
            <CaretRight className="h-3 w-3" />
            <a
              href={href}
              aria-current="page"
              className="inline-flex min-h-11 items-center text-foreground underline-offset-4 hover:underline"
            >
              {breadcrumb}
            </a>
          </li>
        </ol>
      </nav>

      <article className="legal-content" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
