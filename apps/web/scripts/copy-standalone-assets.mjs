// Next.js `output: standalone` does NOT copy static assets or `public/` into
// the standalone bundle — the standalone server.js expects them next to itself.
// Without this, /_next/static/* (CSS + JS chunks) 404 in production: the page
// renders unstyled and never hydrates. Run as part of the build.
//
// It also does NOT reliably trace the native `sharp` module (logo re-encoding)
// into the bundle under Turbopack — at runtime sharp then fails with
// "Could not load the sharp module … libvips-cpp.so… cannot open shared object
// file". So we copy sharp + its platform `@img/*` binaries in explicitly.
//
// Same story for `@swc/helpers`, whose ESM half 16.3.1 leaves behind. Both are
// the same lesson: a green build says nothing about whether the bundle it
// produced can actually boot, so anything Next declines to trace has to be put
// back here by hand.
import { cpSync, existsSync, readdirSync, realpathSync, rmSync } from "node:fs";
import { basename, dirname, join } from "node:path";
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
 *
 * Next actually loads sharp from the standalone ROOT pnpm store
 * (`node_modules/.pnpm/sharp@<ver>/node_modules/sharp`), not from the app's
 * own node_modules — so the @img closure must land *next to that copy*. We
 * also drop it into `apps/web/node_modules/@img` as a belt-and-braces fallback.
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
  const sharpScope = join(dirname(sharpDir), "@img"); // sharp's direct @img deps
  const pnpmSharpDir = basename(dirname(dirname(sharpDir))); // e.g. "sharp@0.35.2"
  const standaloneRoot = join(webRoot, ".next", "standalone");

  // Every place a matching sharp lives in the bundle gets the @img closure next
  // to it. The pnpm-store copy is the one Next loads; the app copy is a fallback.
  const sharpHomes = [
    join(standaloneRoot, "node_modules", ".pnpm", pnpmSharpDir, "node_modules"),
    join(standaloneWeb, "node_modules"),
  ];

  for (const home of sharpHomes) {
    if (!existsSync(home)) continue;
    rmSync(join(home, "sharp"), { recursive: true, force: true });
    cpSync(sharpDir, join(home, "sharp"), { recursive: true, dereference: true });
    const destImg = join(home, "@img");
    rmSync(destImg, { recursive: true, force: true });
    walkImgScope(sharpScope, destImg, new Set());
    console.log(`sharp + @img closure -> ${home}`);
  }
}

/**
 * Restore `@swc/helpers` in the bundle's pnpm store.
 *
 * Next 16.3.1 traces only the `cjs/` half of the package into
 * `output: standalone`, but its own `require-hook` loads the ESM entry point.
 * The bundle therefore starts and then dies on the first request that needs a
 * helper: "Cannot find module …/@swc/helpers/esm/_interop_require_default.js",
 * raised as an unhandledRejection. The process stays alive without ever binding
 * the port, so PM2 reports it as online while every request 503s. This took the
 * site down on 2026-08-17 (next 16.2.12 -> 16.3.1).
 *
 * Copy the whole package rather than just the missing directory, so a future
 * change to which half gets traced cannot reintroduce this. Version-matched per
 * store entry: mixing the `esm/` of one version into another happens to work
 * but is not something to ship.
 */
function copySwcHelpers() {
  const standalonePnpm = join(webRoot, ".next", "standalone", "node_modules", ".pnpm");
  const sourcePnpm = join(webRoot, "..", "..", "node_modules", ".pnpm");
  if (!existsSync(standalonePnpm) || !existsSync(sourcePnpm)) return;

  for (const entry of readdirSync(standalonePnpm)) {
    if (!entry.startsWith("@swc+helpers@")) continue;
    const src = join(sourcePnpm, entry, "node_modules", "@swc", "helpers");
    const dst = join(standalonePnpm, entry, "node_modules", "@swc", "helpers");
    if (!existsSync(src)) {
      console.log(`${entry}: no source copy found, leaving the traced one alone.`);
      continue;
    }
    rmSync(dst, { recursive: true, force: true });
    cpSync(src, dst, { recursive: true, dereference: true });
    console.log(`restored ${entry} -> ${dst}`);
  }
}

if (!existsSync(standaloneWeb)) {
  console.log("No standalone output found; skipping standalone asset copy.");
} else {
  mirror(join(".next", "static"), join(standaloneWeb, ".next", "static"));
  mirror("public", join(standaloneWeb, "public"));
  copySharp();
  copySwcHelpers();
  console.log("Standalone assets ready.");
}
