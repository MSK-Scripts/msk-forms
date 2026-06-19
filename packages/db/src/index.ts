import { PrismaPg } from "@prisma/adapter-pg";
// Extensionless import: the generated Prisma 7 client uses extensionless
// internal imports too, so this resolves under tsc (bundler) AND Turbopack.
import { PrismaClient } from "./generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Prisma 7 connects through a driver adapter (the engine no longer reads the URL).
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export * from "./generated/prisma/client";
