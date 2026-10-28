import { useId, type ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * A section of a dashboard page with a heading, an optional line below it and
 * room for the section's own actions. A labelled region, so the heading names
 * it for a screen reader.
 */
export function SectionCard({
  title,
  description,
  actions,
  children,
  className,
  bodyClassName,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  const id = useId();
  return (
    <section
      aria-labelledby={id}
      className={cn(
        "@container rounded-lg border border-border bg-card text-card-foreground",
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2 border-b border-border px-[clamp(1rem,0.8rem+0.6vw,1.5rem)] py-4">
        <div className="grid min-w-0 gap-1">
          <h2 id={id} className="font-display text-h3 font-[650]">
            {title}
          </h2>
          {description && (
            <div className="max-w-[65ch] text-small text-muted-foreground">{description}</div>
          )}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
      <div className={cn("px-[clamp(1rem,0.8rem+0.6vw,1.5rem)] py-5", bodyClassName)}>
        {children}
      </div>
    </section>
  );
}
