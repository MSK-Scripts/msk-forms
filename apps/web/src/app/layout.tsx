import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { headers } from "next/headers";

import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ThemeProvider } from "@/components/theme-provider";
import { getCurrentUser } from "@/lib/auth";
import { logoUrl, parseBranding } from "@/lib/branding";
import { getGuildByDomain, isPrimaryHostname, requestHostname } from "@/lib/custom-domain";
import { getDirection, getLocale } from "@/i18n";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

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
    { media: "(prefers-color-scheme: light)", color: "#f6f6f6" },
    { media: "(prefers-color-scheme: dark)", color: "#171717" },
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
  const user = await getCurrentUser();
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      dir={getDirection(locale)}
      suppressHydrationWarning
      className={`${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body className="font-sans antialiased">
        <ThemeProvider nonce={nonce}>
          <div className="flex min-h-screen flex-col">
            <SiteHeader user={user} />
            <div className="flex-1">{children}</div>
            <SiteFooter />
          </div>
        </ThemeProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
