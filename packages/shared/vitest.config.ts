import { defineConfig } from "vitest/config";

// Only the TypeScript sources. `pnpm build` compiles the test files into dist/
// as well, and without this vitest picks those up too and runs every suite twice
// (22 files instead of 11 in CI, and a count that depends on whether dist exists).
export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
  },
});
