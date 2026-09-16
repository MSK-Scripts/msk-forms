import { defineConfig } from "vitest/config";

// Only the TypeScript sources. `pnpm build` emits into dist/, and vitest does not
// skip dist by default, so a test added here would otherwise also run from the
// compiled copy (see packages/shared/vitest.config.ts).
export default defineConfig({
  test: {
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
