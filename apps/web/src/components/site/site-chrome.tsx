import type { ReactNode } from "react";

import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

/**
 * The frame of the site pages: header, the one `<main id="main">` the skip
 * link of the root layout points to, footer. Used by the `(site)` route
 * group, by the landing page (which shares `/` with a guild's hub on a custom
 * domain and so cannot sit in that group) and by the not-found page.
 *
 * The public pages of a guild (forms, status, hubs) do not get it: they wear
 * the guild's identity, not msk-scripts.de's (components/public/public-frame).
 */
export function SiteChrome({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
