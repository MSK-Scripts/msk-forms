import type { ReactNode } from "react";

import { ArrowRight } from "@/components/icons";
import { cn } from "@/lib/utils";

/**
 * Frame of a marketing page section, after the shop's Section: kicker,
 * heading and a short intro, then the content. From 1600 px the head stands
 * left of the content and stays in view while the content scrolls; below
 * that they stack. The content is a size container, so its grids follow
 * their own width instead of the window's.
 */
export function Section({
  id,
  kicker,
  title,
  intro,
  action,
  children,
  className,
}: {
  id: string;
  kicker?: string;
  title: string;
  intro?: ReactNode;
  /** Links that lead deeper, below the intro. */
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      aria-labelledby={id}
      className={cn("border-t border-border py-[var(--space-section)]", className)}
    >
      <div className="container-page grid grid-cols-[minmax(0,1fr)] gap-[var(--space-stack)] min-[1600px]:grid-cols-[clamp(20rem,22vw,36rem)_minmax(0,1fr)] min-[1600px]:gap-x-[clamp(3rem,4vw,8rem)]">
        <div className="grid content-start gap-2.5 self-start min-[1600px]:sticky min-[1600px]:top-[calc(var(--header-height)+2rem)]">
          {kicker && <span className="kicker">{kicker}</span>}
          <h2 id={id} className="text-h2 font-bold tracking-[-0.015em]">
            {title}
          </h2>
          {intro && <p className="max-w-[34rem] text-muted-foreground">{intro}</p>}
          {action && <div className="flex flex-wrap gap-x-6">{action}</div>}
        </div>
        <div className="@container min-w-0">{children}</div>
      </div>
    </section>
  );
}

/**
 * The third level of the button hierarchy: a green text link with an arrow.
 * On the anthracite band (`tone="band"`) it takes the band green; the page
 * green would measure about 2.3:1 there.
 */
export function TextLink({
  href,
  children,
  newTab,
  tone = "page",
}: {
  href: string;
  children: ReactNode;
  /** Opens in a new tab; the text says so to a screen reader. */
  newTab?: string;
  tone?: "page" | "band";
}) {
  const colour =
    tone === "band"
      ? "text-band-accent hover:text-band-foreground"
      : "text-primary hover:text-primary-hover";
  return (
    <a
      href={href}
      {...(newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={cn(
        "group inline-flex min-h-11 items-center gap-1.5 font-semibold underline-offset-4 hover:underline",
        colour,
      )}
    >
      {children}
      <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-[3px]" />
      {newTab && <span className="sr-only"> {newTab}</span>}
    </a>
  );
}
