import "dotenv/config";
import { defineConfig, env } from "prisma/config";

// Prisma 7 config (replaces the deprecated package.json#prisma field).
// Prisma 7 no longer auto-loads .env — `dotenv/config` above does it.
// The datasource URL lives here now (Prisma 7 forbids `url` in schema.prisma);
// the runtime client connects via the driver adapter (see packages/db/src/index.ts).
export default defineConfig({
  schema: "packages/db/prisma/schema.prisma",
  migrations: {
    path: "packages/db/prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
