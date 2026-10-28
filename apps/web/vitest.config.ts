import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

export default defineConfig({
  // tsconfig keeps JSX for Next ("preserve"); tests compile it with the
  // automatic runtime, so component modules render without importing React.
  esbuild: { jsx: "automatic" },
  resolve: {
    alias: {
      // `server-only` only resolves inside the Next build; stub it for unit tests.
      "server-only": fileURLToPath(new URL("./src/test/server-only.stub.ts", import.meta.url)),
      // Mirror the tsconfig "@/*" path alias so tests import like the app does.
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
