// Generates the PWA / home-screen icon set from public/logo.png (the green M
// mark). Run once after the logo changes; the output PNGs are committed so the
// deploy needs no generation step:
//
//   node apps/web/scripts/generate-pwa-icons.mjs
//
// Output (public/icons/):
//   icon-192.png            transparent, "any" purpose
//   icon-512.png            transparent, "any" purpose
//   icon-maskable-512.png   solid bg + safe-zone padding, "maskable" purpose
//   apple-touch-icon.png    180px, solid bg (iOS has no transparency handling)
import { fileURLToPath } from "node:url";
import path from "node:path";
import sharp from "sharp";

const here = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(here, "..", "public");
const iconsDir = path.join(publicDir, "icons");
const source = path.join(publicDir, "logo.png");

// White keeps the green M readable on both light/dark home screens and matches
// the apple-touch convention (no alpha). Maskable/apple use it; the plain
// "any" icons stay transparent so the OS can theme the backdrop.
const BG = { r: 255, g: 255, b: 255, alpha: 1 };

/** Resize the logo to `inner` px (contain, transparent pad) centered on a
 *  `size`×`size` canvas with the given background. */
async function render({ size, inner, background, out }) {
  const logo = await sharp(source)
    .resize(inner, inner, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();
  await sharp({
    create: { width: size, height: size, channels: 4, background },
  })
    .composite([{ input: logo, gravity: "center" }])
    .png()
    .toFile(out);
  console.log("wrote", path.relative(publicDir, out));
}

await sharp({ create: { width: 1, height: 1, channels: 4, background: BG } }); // warm up / fail fast
await import("node:fs/promises").then((fs) => fs.mkdir(iconsDir, { recursive: true }));

const TRANSPARENT = { r: 0, g: 0, b: 0, alpha: 0 };

await render({ size: 192, inner: Math.round(192 * 0.86), background: TRANSPARENT, out: path.join(iconsDir, "icon-192.png") });
await render({ size: 512, inner: Math.round(512 * 0.86), background: TRANSPARENT, out: path.join(iconsDir, "icon-512.png") });
// Maskable: content must live inside the center ~80% safe zone, so pad more.
await render({ size: 512, inner: Math.round(512 * 0.62), background: BG, out: path.join(iconsDir, "icon-maskable-512.png") });
await render({ size: 180, inner: Math.round(180 * 0.78), background: BG, out: path.join(iconsDir, "apple-touch-icon.png") });

console.log("done");
