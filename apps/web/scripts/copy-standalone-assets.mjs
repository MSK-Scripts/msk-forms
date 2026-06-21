// Next.js `output: standalone` does NOT copy static assets or `public/` into
// the standalone bundle — the standalone server.js expects them next to itself.
// Without this, /_next/static/* (CSS + JS chunks) 404 in production: the page
// renders unstyled and never hydrates. Run as part of the build.
//
// It also does NOT reliably trace the native `sharp` module (logo re-encoding)
// into the bundle under Turbopack — at runtime sharp then fails with
// "Could not load the sharp module … libvips-cpp.so… cannot open shared object
// file". So we copy sharp + its platform `@img/*` binaries in explicitly.
import { cpSync, existsSync, readdirSync, realpathSync, rmSync } from "node:fs";
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
 * Walk the `@img/*` dependency closure starting from a package's `@img` scope
 * dir, copying each package (correct version, symlinks dereferenced) into the
 * destination `@img` dir. Recursion is required because libvips
 * (`@img/sharp-libvips-<platform>`) is a *transitive* dep of the platform
 * binary (`@img/sharp-<platform>`), not a direct sibling of `sharp` — copying
 * only the direct level leaves the `.so` out and dlopen fails at runtime.
 */
function walkImgScope(scopeDir, destImg, seen) {
  if (!existsSync(scopeDir)) return;
  for (const name of readdirSync(scopeDir)) {
    if (seen.has(name)) continue;
    seen.add(name);
    const real = realpathSync(join(scopeDir, name)); // …/@img/<name> (real pkg)
    cpSync(real, join(destImg, name), { recursive: true, dereference: true });
    console.log(`copied @img/${name}`);
    // This package's own @img peers live next to it — recurse for libvips etc.
    walkImgScope(dirname(real), destImg, seen);
  }
}

/**
 * Copy the native `sharp` package plus its full `@img/*` binary closure
 * (platform module + libvips + colour) into the standalone bundle. Next 16's
 * Turbopack build keeps sharp external but doesn't trace these into
 * `output: standalone`, so the runtime require fails without this.
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
  // realpath → …/.pnpm/sharp@<ver>/node_modules/sharp
  const sharpDir = realpathSync(link);
  const destNodeModules = join(standaloneWeb, "node_modules");

  rmSync(join(destNodeModules, "sharp"), { recursive: true, force: true });
  cpSync(sharpDir, join(destNodeModules, "sharp"), { recursive: true, dereference: true });
  console.log("copied sharp");

  // sharp's @img deps live next to it (…/sharp@ver/node_modules/@img); walk the
  // whole closure so libvips comes along with the right version.
  const destImg = join(destNodeModules, "@img");
  rmSync(destImg, { recursive: true, force: true });
  walkImgScope(join(dirname(sharpDir), "@img"), destImg, new Set());
}

if (!existsSync(standaloneWeb)) {
  console.log("No standalone output found; skipping standalone asset copy.");
} else {
  mirror(join(".next", "static"), join(standaloneWeb, ".next", "static"));
  mirror("public", join(standaloneWeb, "public"));
  copySharp();
  console.log("Standalone assets ready.");
}
