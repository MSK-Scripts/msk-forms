"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";

export interface NavTab {
  // Plain string (cast to Route internally): typedRoutes types only exist
  // after a build, so the separate `tsc` typecheck can't validate them.
  href: string;
  label: string;
  /** Match the pathname exactly (default) or as a prefix. */
  prefix?: boolean;
}

/** Horizontal tab navigation with active highlighting from the pathname. */
export function NavTabs({ tabs }: { tabs: NavTab[] }) {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1">
      {tabs.map((tab) => {
        const active = tab.prefix
          ? pathname.startsWith(tab.href)
          : pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href as Route}
            className={`rounded-md px-3 py-1.5 font-mono text-xs uppercase tracking-widest transition-colors ${
              active
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
