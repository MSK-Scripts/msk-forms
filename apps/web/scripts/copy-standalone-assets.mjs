// Next.js `output: standalone` does NOT copy static assets or `public/` into
// the standalone bundle — the standalone server.js expects them next to itself.
// Without this, /_next/static/* (CSS + JS chunks) 404 in production: the page
// renders unstyled and never hydrates. Run as part of the build.
import { cpSync, existsSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const webRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const standaloneWeb = join(webRoot, ".next", "standalone", "apps", "web");

function mirror(srcRel, dstAbs) {
  const src = join(webRoot, srcRel);
  if (!existsSync(src)) return;
  rmSync(dstAbs, { recursive: true, force: true });
  cpSync(src, dstAbs, { recursive: true });
  console.log(`copied ${srcRel} -> ${dstAbs}`);
}

if (!existsSync(standaloneWeb)) {
  console.log("No standalone output found; skipping static asset copy.");
} else {
  mirror(join(".next", "static"), join(standaloneWeb, ".next", "static"));
  mirror("public", join(standaloneWeb, "public"));
  console.log("Standalone static assets ready.");
}
