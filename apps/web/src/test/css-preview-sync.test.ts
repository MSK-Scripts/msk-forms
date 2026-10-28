import { describe, expect, it } from "vitest";

import { PREVIEW_BASE_CSS } from "../components/branding/css-preview-base";
import { brandVariables } from "../lib/branding";
import { GUILD_ACCENT_CSS } from "../lib/guild-accent-css";

import { blockDeclarations, GLOBALS_CSS, sourceTokens } from "./tokens";

/**
 * The custom CSS preview on the branding page renders in a sandboxed iframe
 * with its own copy of the base tokens. Custom CSS behaves there as on the
 * live page only while that copy matches app/globals.css in both themes.
 */

const preview = {
  light: blockDeclarations(PREVIEW_BASE_CSS, ":root"),
  dark: { ...blockDeclarations(PREVIEW_BASE_CSS, ":root"), ...blockDeclarations(PREVIEW_BASE_CSS, ".dark") },
};
const live = sourceTokens();

describe("custom CSS preview", () => {
  it.each(["light", "dark"] as const)("uses the token values of globals.css in the %s theme", (theme) => {
    const drift = Object.entries(preview[theme])
      .filter(([name, value]) => live[theme][name] !== value)
      .map(([name, value]) => `--${name}: preview ${value}, globals ${live[theme][name] ?? "(missing)"}`);
    expect(drift).toEqual([]);
  });

  it("declares every variable its rules read", () => {
    // The accent sets come inline on the wrapper, as brandVariables builds them.
    const inline = Object.keys(brandVariables("#3366cc")!).map((name) => name.slice(2));
    const read = [...PREVIEW_BASE_CSS.matchAll(/var\(--([a-z0-9-]+)\)/g)].map(([, name]) => name!);
    expect([...new Set(read)].filter((name) => !(name in preview.light) && !inline.includes(name))).toEqual([]);
  });

  it("maps the accent with the same rules as globals.css, in a layer", () => {
    // Whitespace and comments aside, the text must be identical, so the
    // preview shows the readable fallback and lets custom CSS win as the
    // live page does.
    const normalise = (css: string) =>
      css
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/\s+/g, " ")
        .replace(/\s*([{};:,])\s*/g, "$1")
        .trim();
    expect(normalise(GLOBALS_CSS)).toContain(normalise(`@layer base {${GUILD_ACCENT_CSS}}`));
    expect(normalise(PREVIEW_BASE_CSS)).toContain(normalise(`@layer base {${GUILD_ACCENT_CSS}}`));
  });
});
