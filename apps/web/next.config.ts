import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output for the PM2 deploy on the Debian server
  output: "standalone",
  reactStrictMode: true,
  // Geteilte Workspace-Packages transpilieren
  transpilePackages: ["@msk-forms/ui", "@msk-forms/shared", "@msk-forms/db"],
  // typedRoutes graduated out of `experimental` in Next.js 16.
  typedRoutes: true,
  // sharp is a native module (logo re-encoding) — keep it external, don't bundle.
  // stripe is a heavy server-only SDK — keep it external too. exceljs (XLSX
  // export) is large with many deps — keep it external, don't bundle.
  serverExternalPackages: ["sharp", "stripe", "exceljs"],
  // Note: Next.js 16 removed `next lint` — linting runs centrally via the
  // flat config (eslint.config.mjs) at the monorepo root.
};

export default nextConfig;
