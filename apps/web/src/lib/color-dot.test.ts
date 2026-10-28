import { describe, expect, it } from "vitest";

import { UI_CONTRAST, type Theme } from "./branding";
import { luminance } from "./color";
import { dotColors, dotContrast, readableDot } from "./color-dot";

const THEMES: Theme[] = ["light", "dark"];

/** Colours guilds pick for statuses and categories, from the brief's cases to the extremes. */
const COLOURS = ["#1e3a8a", "#000080", "#facc15", "#fef9c3", "#6b6b72", "#4ea426", "#27762e", "#ef4444", "#000000", "#ffffff"];

describe("readable colour dots", () => {
  it.each(COLOURS)("%s reaches 3:1 on every surface of both themes", (hex) => {
    for (const theme of THEMES) {
      expect(dotContrast(readableDot(hex, theme), theme), `${hex} in ${theme}`).toBeGreaterThanOrEqual(UI_CONTRAST);
    }
  });

  it("keeps a colour that passes and changes only the theme it fails in", () => {
    // Navy reads on the light ground but vanishes on anthracite.
    const navy = dotColors("#1e3a8a");
    expect(navy.color).toBe("#1e3a8a");
    expect(navy.darkColor).not.toBe("#1e3a8a");
    // A pale yellow is the other way round.
    const pale = dotColors("#fef9c3");
    expect(pale.darkColor).toBe("#fef9c3");
    expect(pale.color).not.toBe("#fef9c3");
  });

  it("keeps the hue: the fallback is lighter in dark and darker in light", () => {
    expect(luminance(readableDot("#1e3a8a", "dark"))).toBeGreaterThan(luminance("#1e3a8a"));
    expect(luminance(readableDot("#fef9c3", "light"))).toBeLessThan(luminance("#fef9c3"));
  });

  it("passes a half-typed colour through and leaves a missing one to the component", () => {
    expect(dotColors("#12")).toEqual({ color: "#12", darkColor: "#12" });
    expect(dotColors(undefined)).toEqual({});
    expect(dotColors("")).toEqual({});
  });
});
