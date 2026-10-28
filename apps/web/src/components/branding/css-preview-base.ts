/**
 * Base stylesheet of the custom CSS preview (css-preview.tsx). Mirrors the
 * public form's token system, the same `--primary`, `--card`, `--radius` …
 * names and light/dark values as app/globals.css, and the `.msk-form`
 * wrapper, so custom CSS that targets `.msk-form` or overrides a variable
 * behaves here as it will on the live page. Self-contained (no Tailwind) so
 * the preview renders in an isolated iframe; the iframe cannot reach the
 * self-hosted web fonts, so it falls back to the system sans.
 *
 * src/test/css-preview-sync.test.ts fails when a value here drifts from
 * globals.css or a rule reads a variable that is not declared here.
 */
export const PREVIEW_BASE_CSS = `
:root{--background:60 10% 96.1%;--foreground:220 5.1% 11.6%;--card:0 0% 100%;--card-foreground:220 5.1% 11.6%;--primary:125.3 50.3% 30.8%;--primary-foreground:0 0% 100%;--secondary:60 7.7% 92.4%;--muted-foreground:214.3 3.7% 36.7%;--border:60 5.4% 85.5%;--input:214.3 2.9% 53.1%;--ring:125.3 50.3% 30.8%;--radius:0.625rem;}
.dark{--background:220 5.9% 10%;--foreground:60 5% 92.2%;--card:225 5.7% 13.7%;--card-foreground:60 5% 92.2%;--primary:97.1 50.8% 48.6%;--primary-foreground:120 20% 6.9%;--secondary:225 4.5% 17.3%;--muted-foreground:220 3.5% 66.7%;--border:220 5.8% 20.4%;--input:217.5 3.5% 44.3%;--ring:97.1 50.8% 48.6%;}
*{box-sizing:border-box;}
html,body{margin:0;}
body{background:hsl(var(--background));color:hsl(var(--foreground));font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;font-size:1.0625rem;line-height:1.6;-webkit-font-smoothing:antialiased;padding:1.25rem;}
.msk-form{max-width:42rem;margin:0 auto;display:flex;flex-direction:column;gap:1.25rem;}
.msk-form .brand{font-size:.9375rem;font-weight:600;color:hsl(var(--primary));}
.msk-form h1{font-size:1.75rem;font-weight:700;line-height:1.15;margin:.25rem 0 0;color:hsl(var(--foreground));}
.msk-form .desc{color:hsl(var(--muted-foreground));margin:.25rem 0 0;}
.msk-form .card{border:1px solid hsl(var(--border));background:hsl(var(--card));color:hsl(var(--card-foreground));border-radius:var(--radius);padding:1.5rem;box-shadow:0 1px 2px rgba(0,0,0,.05);display:flex;flex-direction:column;gap:1rem;}
.msk-form label{display:block;font-weight:600;margin-bottom:.375rem;color:hsl(var(--foreground));}
.msk-form input,.msk-form textarea{width:100%;min-height:2.75rem;border:1.5px solid hsl(var(--input));background:hsl(var(--card));border-radius:calc(var(--radius) - 4px);padding:.5rem .75rem;font:inherit;color:inherit;}
.msk-form .btn{align-self:flex-start;min-height:2.75rem;background:hsl(var(--primary));color:hsl(var(--primary-foreground));border:none;border-radius:calc(var(--radius) - 4px);padding:.5rem 1.125rem;font:inherit;font-weight:600;cursor:default;}
`;
