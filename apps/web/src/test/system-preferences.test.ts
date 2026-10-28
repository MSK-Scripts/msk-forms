import { describe, expect, it } from "vitest";

import { GLOBALS_CSS } from "./tokens";

/**
 * The app follows the visitor's system settings for motion, contrast and the
 * Windows contrast themes (DESIGN.md, Accessibility). The rules live in
 * app/globals.css.
 */
function mediaBlock(query: string): string {
  const start = GLOBALS_CSS.indexOf(`@media (${query})`);
  expect(start, `no @media (${query}) in globals.css`).toBeGreaterThan(-1);
  return GLOBALS_CSS.slice(start, GLOBALS_CSS.indexOf("\n}", start));
}

describe("system preferences", () => {
  it("stops motion when reduced motion is asked for", () => {
    expect(mediaBlock("prefers-reduced-motion: reduce")).toMatch(/transition-duration:\s*0\.01ms/);
  });

  it("raises secondary text and lines to full strength for more contrast", () => {
    const rules = mediaBlock("prefers-contrast: more");
    expect(rules).toMatch(/--muted-foreground:\s*var\(--foreground\)/);
    expect(rules).toMatch(/--border:\s*var\(--input\)/);
  });

  it("gives controls a system border in forced colours", () => {
    expect(mediaBlock("forced-colors: active")).toMatch(/border:\s*1px solid ButtonText/);
  });
});
