import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output for the PM2 deploy on the Debian server
  output: "standalone",
  reactStrictMode: true,
  // Geteilte Workspace-Packages transpilieren
  transpilePackages: ["@msk-forms/ui", "@msk-forms/shared", "@msk-forms/db"],
  experimental: {
    typedRoutes: true,
  },
  // Note: Next.js 16 removed `next lint` — linting runs centrally via the
  // flat config (eslint.config.mjs) at the monorepo root.
};

export default nextConfig;
