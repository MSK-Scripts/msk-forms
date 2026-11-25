import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output for the PM2 deploy on the Debian server
  output: "standalone",
  reactStrictMode: true,
  // Geteilte Workspace-Packages transpilieren
  transpilePackages: ["@msk-forms/ui", "@msk-forms/shared", "@msk-forms/db"],
  // typedRoutes graduated out of `experimental` in Next.js 16.
  typedRoutes: true,
  // Metadata is resolved before the head is sent, for every user agent. Next
  // streams it for anything outside its own bot list, and a canonical that
  // resolves after the shell lands after </head>, where crawlers outside the
  // list do not look for it. One regex for all turns streaming off.
  htmlLimitedBots: /.*/,
  // The proxy sets the security headers for documents but does not run for
  // build assets (see the matcher in src/proxy.ts). Same values as there; the
  // static files get a CSP that allows nothing, since they are no documents.
  async headers() {
    const base = [
      { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    ];
    return [
      {
        source: "/_next/static/:path*",
        headers: [
          ...base,
          { key: "Content-Security-Policy", value: "default-src 'none'; frame-ancestors 'none'" },
        ],
      },
      { source: "/_next/image", headers: base },
    ];
  },
  // sharp is a native module (logo re-encoding) — keep it external, don't bundle.
  // stripe is a heavy server-only SDK — keep it external too. exceljs (XLSX
  // export) is large with many deps — keep it external, don't bundle.
  serverExternalPackages: ["sharp", "stripe", "exceljs"],
  // Note: Next.js 16 removed `next lint` — linting runs centrally via the
  // flat config (eslint.config.mjs) at the monorepo root.
};

export default nextConfig;
