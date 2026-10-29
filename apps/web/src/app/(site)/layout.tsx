import { SiteChrome } from "@/components/site/site-chrome";

/**
 * The site pages (pricing, statistics, legal pages) in the frame of
 * msk-scripts.de: header, footer, the one `<main id="main">`.
 *
 * A route group, so it adds nothing to an address: `/pricing` stays
 * `/pricing`, and static segments still win over `[handle]` exactly as
 * before. The landing page shares `/` with a guild's hub on a custom domain
 * and renders the same frame itself (app/page.tsx). The public pages of a
 * guild stay outside, with a frame of their own.
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <SiteChrome>{children}</SiteChrome>;
}
