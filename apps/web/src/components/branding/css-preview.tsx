"use client";

import { sanitizeCustomCss } from "@msk-forms/shared";
import { useTheme } from "next-themes";
import { useMemo, useSyncExternalStore } from "react";

import { brandVariables, GUILD_ACCENT_ATTRIBUTE } from "@/lib/branding";

import { PREVIEW_BASE_CSS } from "./css-preview-base";

const HEX = /^#[0-9a-fA-F]{6}$/;

const noSubscription = () => () => {};

/** False on the server and during hydration, true afterwards. */
function useHydrated(): boolean {
  return useSyncExternalStore(
    noSubscription,
    () => true,
    () => false,
  );
}

export interface CssPreviewLabels {
  guild: string;
  title: string;
  desc: string;
  field: string;
  field2: string;
  submit: string;
}

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
  title,
  labels,
}: {
  css: string;
  accentColor: string;
  /** Name of the frame for a screen reader, the visible "Live preview". */
  title: string;
  labels: CssPreviewLabels;
}) {
  const { resolvedTheme } = useTheme();
  // The theme is only known in the browser. Reading it during hydration would
  // render a different srcDoc than the server did, and React does not patch a
  // mismatched attribute: the frame would stay light on a dark dashboard.
  const hydrated = useHydrated();
  const dark = hydrated && resolvedTheme === "dark";

  const srcDoc = useMemo(() => {
    const safe = sanitizeCustomCss(css);
    const trimmed = accentColor.trim();
    // The same variables and attribute brandProps puts on the live page's
    // wrapper, so the preview shows the readable fallback accent per theme.
    const vars = HEX.test(trimmed) ? brandVariables(trimmed) : null;
    const accentStyle = vars
      ? ` ${GUILD_ACCENT_ATTRIBUTE}="" style="${Object.entries(vars)
          .map(([name, value]) => `${name}:${value}`)
          .join(";")}"`
      : "";
    return `<!doctype html><html${dark ? ' class="dark"' : ""}><head><meta charset="utf-8"><meta name="color-scheme" content="light dark"><style>${PREVIEW_BASE_CSS}</style><style>${safe}</style></head><body><main class="msk-form"${accentStyle}><header><span class="brand">${esc(labels.guild)}</span><h1>${esc(labels.title)}</h1><p class="desc">${esc(labels.desc)}</p></header><div class="card"><div><label>${esc(labels.field)}</label><input placeholder="" /></div><div><label>${esc(labels.field2)}</label><textarea rows="3"></textarea></div><button class="btn" type="button">${esc(labels.submit)}</button></div></main></body></html>`;
  }, [css, accentColor, dark, labels]);

  return (
    <iframe
      title={title}
      sandbox=""
      srcDoc={srcDoc}
      className="h-[34rem] w-full rounded-md border border-border bg-background"
    />
  );
}
