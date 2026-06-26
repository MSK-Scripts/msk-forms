# public/

Static assets served from the site root. Drop your own files here — they are
reachable at `https://forms.msk-scripts.de/<filename>`.

## Expected files (replace the placeholders with your own)

| File | Used for | Referenced in |
|---|---|---|
| `favicon.svg` | Browser tab icon (modern) | `app/layout.tsx` metadata |
| `favicon.ico` | Browser tab icon (fallback) | auto-detected by browsers at `/favicon.ico` |
| `logo.svg` | App logo (header / login) | `app/layout.tsx` / components |
| `og-image.png` | Social share preview (1200×630) | metadata `openGraph.images` |
| `apple-icon.png` | iOS home-screen icon (180×180) | auto-detected |

Keep the file names above and your assets are picked up automatically, no code
change needed. Currently present: `favicon.ico` (tab icon) and `logo.png` (the
green M mark, used in the header/footer wordmark and as the apple-touch icon).

## PWA assets (generated)

| File | Used for |
|---|---|
| `sw.js` | Service worker (offline shell + installability). Registered by `components/pwa/service-worker-register.tsx`. |
| `icons/icon-192.png`, `icons/icon-512.png` | Home-screen icons (`any` purpose) — referenced by `app/manifest.ts`. |
| `icons/icon-maskable-512.png` | Android adaptive icon (safe-zone padding, `maskable` purpose). |
| `icons/apple-touch-icon.png` | iOS home-screen icon (180×180). |

The `icons/*` files are generated from `logo.png` and committed (no build-time
step). Regenerate after the logo changes:

```bash
node apps/web/scripts/generate-pwa-icons.mjs
```
