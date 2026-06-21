// Next.js `output: standalone` does NOT copy static assets or `public/` into
// the standalone bundle — the standalone server.js expects them next to itself.
// Without this, /_next/static/* (CSS + JS chunks) 404 in production: the page
// renders unstyled and never hydrates. Run as part of the build.
//
// It also does NOT reliably trace the native `sharp` module (logo re-encoding)
// into the bundle under Turbopack — at runtime sharp then fails with
// "Could not load the sharp module … libvips-cpp.so… cannot open shared object
// file". So we copy sharp + its platform `@img/*` binaries in explicitly.
import { cpSync, existsSync, realpathSync, rmSync } from "node:fs";
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

/**
 * Copy the native `sharp` package and its sibling `@img/*` binaries (resolved
 * through pnpm's `.pnpm` store) into the standalone bundle, dereferencing
 * symlinks so the real `.node`/`.so` files land next to the server.
 */
function copySharp() {
  // Resolve via the filesystem symlink (not require.resolve — sharp's `exports`
  // field blocks resolving subpaths like ./package.json).
  const link = [
    join(webRoot, "node_modules", "sharp"),
    join(webRoot, "..", "..", "node_modules", "sharp"),
  ].find(existsSync);
  if (!link) {
    console.log("sharp not found; skipping (logo upload will be unavailable).");
    return;
  }
  // realpath → .../.pnpm/sharp@<ver>/node_modules/sharp ; its parent holds @img.
  const sharpDir = realpathSync(link);
  const storeNodeModules = dirname(sharpDir);
  const destNodeModules = join(standaloneWeb, "node_modules");

  for (const dep of ["sharp", "@img"]) {
    const src = join(storeNodeModules, dep);
    if (!existsSync(src)) continue;
    const dst = join(destNodeModules, dep);
    rmSync(dst, { recursive: true, force: true });
    cpSync(src, dst, { recursive: true, dereference: true });
    console.log(`copied ${dep} -> ${dst}`);
  }
}

if (!existsSync(standaloneWeb)) {
  console.log("No standalone output found; skipping standalone asset copy.");
} else {
  mirror(join(".next", "static"), join(standaloneWeb, ".next", "static"));
  mirror("public", join(standaloneWeb, "public"));
  copySharp();
  console.log("Standalone assets ready.");
}
