import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";

import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";
import { ErrorCopyProvider } from "@/components/site/error-copy";
import { ThemeProvider } from "@/components/theme-provider";
import { logoUrl, parseBranding, THEME_SURFACES } from "@/lib/branding";
import { getGuildByDomain, isPrimaryHostname, requestHostname } from "@/lib/custom-domain";
import { getDict, getDirection, getLocale } from "@/i18n";
// Fonts come from the @fontsource-variable packages and are served by this
// app, like in msk-shop: nothing is fetched from Google, neither at build time
// nor in the browser, and the CSP needs nothing beyond `font-src 'self'`.
// Archivo with its weight and width axes (headings, names), Source Sans 3 for
// everything else; unicode-range loads only the subsets a page uses.
import "@fontsource-variable/archivo/standard.css";
import "@fontsource-variable/source-sans-3";
import "./globals.css";

const DEFAULT_METADATA: Metadata = {
  title: "MSK Forms: application forms with a status loop",
  description:
    "Build application forms, collect submissions, and let applicants track their status live. With a Discord bot any server can invite.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "MSK Forms",
    statusBarStyle: "default",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/icons/apple-touch-icon.png",
  },
};

/**
 * Theme color follows the system scheme so the mobile browser/PWA title bar
 * matches light/dark. `viewport-fit=cover` lets safe-area insets apply on
 * notched phones (used by sticky headers / bottom bars).
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: THEME_SURFACES.light.background },
    { media: "(prefers-color-scheme: dark)", color: THEME_SURFACES.dark.background },
  ],
};

/**
 * Host-aware metadata: on a guild's verified custom domain, use that guild's
 * name and (if set) its logo as the browser favicon, so the tab looks like the
 * guild's own site. Falls back to the MSK Forms defaults everywhere else.
 */
export async function generateMetadata(): Promise<Metadata> {
  const host = await requestHostname();
  if (!host || isPrimaryHostname(host)) return DEFAULT_METADATA;

  const guild = await getGuildByDomain(host);
  if (!guild) return DEFAULT_METADATA;

  const logo = logoUrl(guild.id, parseBranding(guild.branding));
  return {
    ...DEFAULT_METADATA,
    title: guild.name,
    ...(logo
      ? { icons: { icon: [{ url: logo, type: "image/webp" }], apple: logo } }
      : {}),
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  const [locale, dict] = await Promise.all([getLocale(), getDict()]);

  return (
    <html
      lang={locale}
      dir={getDirection(locale)}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased">
        {/* Skip link (WCAG 2.4.1), the first element of every page and
            server-rendered, so it works without JavaScript. Every frame below
            renders exactly one <main id="main">: the site pages through
            SiteChrome, the public pages of a guild through PublicFrame. */}
        <a href="#main" className="skip-link">
          {dict.site.skipToContent}
        </a>
        <ThemeProvider nonce={nonce}>
          <ErrorCopyProvider
            copy={{
              kicker: dict.site.errorKicker,
              title: dict.site.errorTitle,
              text: dict.site.errorText,
              retry: dict.site.errorRetry,
              home: dict.site.notFoundHome,
            }}
          >
            {children}
          </ErrorCopyProvider>
        </ThemeProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
