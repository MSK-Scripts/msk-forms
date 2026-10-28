import { describe, expect, it } from "vitest";

import { PREVIEW_BASE_CSS } from "../components/branding/css-preview-base";

import { blockDeclarations, sourceTokens } from "./tokens";

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
    const read = [...PREVIEW_BASE_CSS.matchAll(/var\(--([a-z0-9-]+)\)/g)].map(([, name]) => name!);
    expect([...new Set(read)].filter((name) => !(name in preview.light))).toEqual([]);
  });
});
