import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone-Output für PM2-Deploy auf dem Debian-Server
  output: "standalone",
  reactStrictMode: true,
  // Geteilte Workspace-Packages transpilieren
  transpilePackages: ["@msk-forms/ui", "@msk-forms/shared", "@msk-forms/db"],
  experimental: {
    typedRoutes: true,
  },
};

export default nextConfig;
