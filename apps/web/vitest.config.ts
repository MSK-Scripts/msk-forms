import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      // `server-only` only resolves inside the Next build; stub it for unit tests.
      "server-only": fileURLToPath(new URL("./src/test/server-only.stub.ts", import.meta.url)),
    },
  },
});
