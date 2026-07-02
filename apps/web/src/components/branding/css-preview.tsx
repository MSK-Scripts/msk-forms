"use client";

import { sanitizeCustomCss } from "@msk-forms/shared";
import { useTheme } from "next-themes";
import { useMemo } from "react";

import { hexToHslChannels } from "@/lib/branding";

const HEX = /^#[0-9a-fA-F]{6}$/;

export interface CssPreviewLabels {
  guild: string;
  title: string;
  desc: string;
  field: string;
  field2: string;
  submit: string;
}

/**
 * Base stylesheet for the preview document. Mirrors the public form's token
 * system (the same `--primary`, `--card`, `--radius` … names and light/dark
 * values from globals.css) and the `.msk-form` wrapper, so custom CSS that
 * targets `.msk-form` or overrides a CSS variable behaves here exactly as it
 * will on the live page. Deliberately self-contained (no Tailwind) so the
 * preview renders in an isolated iframe.
 */
const BASE_CSS = `
:root{--background:0 0% 96.5%;--foreground:0 0% 10%;--card:0 0% 100%;--card-foreground:0 0% 10%;--primary:101 62% 40%;--primary-foreground:0 0% 100%;--secondary:0 0% 93%;--muted-foreground:0 0% 42%;--border:0 0% 88%;--input:0 0% 88%;--ring:101 62% 40%;--radius:0.75rem;}
.dark{--background:0 0% 9%;--foreground:0 0% 97%;--card:0 0% 12%;--card-foreground:0 0% 97%;--primary:99 57% 44%;--primary-foreground:0 0% 100%;--secondary:0 0% 17%;--muted-foreground:0 0% 66%;--border:0 0% 20%;--input:0 0% 23%;--ring:99 57% 44%;}
*{box-sizing:border-box;}
html,body{margin:0;}
body{background:hsl(var(--background));color:hsl(var(--foreground));font-family:Inter,system-ui,-apple-system,Segoe UI,sans-serif;-webkit-font-smoothing:antialiased;padding:1.25rem;}
.msk-form{max-width:42rem;margin:0 auto;display:flex;flex-direction:column;gap:1.25rem;}
.msk-form .brand{font-size:.875rem;font-weight:500;color:hsl(var(--primary));}
.msk-form h1{font-size:1.75rem;font-weight:700;margin:.25rem 0 0;color:hsl(var(--foreground));}
.msk-form .desc{color:hsl(var(--muted-foreground));margin:.25rem 0 0;}
.msk-form .card{border:1px solid hsl(var(--border));background:hsl(var(--card));border-radius:var(--radius);padding:1.5rem;box-shadow:0 1px 2px rgba(0,0,0,.06);display:flex;flex-direction:column;gap:1rem;}
.msk-form label{display:block;font-size:.875rem;font-weight:500;margin-bottom:.375rem;color:hsl(var(--foreground));}
.msk-form input,.msk-form textarea{width:100%;border:1px solid hsl(var(--input));background:hsl(var(--background));border-radius:calc(var(--radius) - .25rem);padding:.5rem .75rem;font:inherit;color:inherit;}
.msk-form .btn{align-self:flex-start;background:hsl(var(--primary));color:hsl(var(--primary-foreground));border:none;border-radius:calc(var(--radius) - .25rem);padding:.55rem 1.1rem;font-weight:500;font-size:.9rem;cursor:default;}
`;

/** Escape text for safe interpolation into the preview HTML. */
function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Live, isolated preview of a guild's public form with the current accent color
 * and custom CSS applied. Rendered in a sandboxed iframe so the CSS can't leak
 * into the dashboard or run scripts; the CSS is sanitized the same way it is on
 * save/render, so what you see matches the live page.
 */
export function CssPreview({
  css,
  accentColor,
  labels,
}: {
  css: string;
  accentColor: string;
  labels: CssPreviewLabels;
}) {
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme === "dark";

  const srcDoc = useMemo(() => {
    const safe = sanitizeCustomCss(css);
    const trimmed = accentColor.trim();
    const channels = HEX.test(trimmed) ? hexToHslChannels(trimmed) : null;
    const accentStyle = channels ? ` style="--primary:${channels};--ring:${channels}"` : "";
    return `<!doctype html><html${dark ? ' class="dark"' : ""}><head><meta charset="utf-8"><meta name="color-scheme" content="light dark"><style>${BASE_CSS}</style><style>${safe}</style></head><body><main class="msk-form"${accentStyle}><header><span class="brand">${esc(labels.guild)}</span><h1>${esc(labels.title)}</h1><p class="desc">${esc(labels.desc)}</p></header><div class="card"><div><label>${esc(labels.field)}</label><input placeholder="" /></div><div><label>${esc(labels.field2)}</label><textarea rows="3"></textarea></div><button class="btn" type="button">${esc(labels.submit)}</button></div></main></body></html>`;
  }, [css, accentColor, dark, labels]);

  return (
    <iframe
      title="preview"
      sandbox=""
      srcDoc={srcDoc}
      className="h-[440px] w-full rounded-md border border-border bg-background"
    />
  );
}
