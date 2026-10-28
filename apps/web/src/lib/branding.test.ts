import { describe, expect, it } from "vitest";

import { brandStyle, contrastRatio, hexToHslChannels, parseBranding } from "./branding";

describe("hexToHslChannels", () => {
  it("converts primary colors", () => {
    expect(hexToHslChannels("#000000")).toBe("0 0% 0%");
    expect(hexToHslChannels("#ffffff")).toBe("0 0% 100%");
    expect(hexToHslChannels("#ff0000")).toBe("0 100% 50%");
  });

  it("rejects malformed hex", () => {
    expect(hexToHslChannels("00E676")).toBeNull();
    expect(hexToHslChannels("#fff")).toBeNull();
  });
});

describe("brandStyle", () => {
  it("returns undefined without an accent color", () => {
    expect(brandStyle({})).toBeUndefined();
  });

  it("overrides the primary, label and ring tokens", () => {
    expect(brandStyle({ accentColor: "#27762e" })).toEqual({
      "--primary": "125 50% 31%",
      "--primary-foreground": "0 0% 100%",
      "--ring": "125 50% 31%",
    });
  });

  it("gives a light accent the dark label and a dark accent the white one", () => {
    // The label follows the colour, not the theme: the dark theme's own
    // label is near black and would vanish on a navy accent.
    const label = (accentColor: string) =>
      (brandStyle({ accentColor }) as Record<string, string>)["--primary-foreground"];
    expect(label("#facc15")).toBe("120 20% 6.9%");
    expect(label("#ff0000")).toBe("120 20% 6.9%");
    expect(label("#1e3a8a")).toBe("0 0% 100%");
    expect(label("#5865f2")).toBe("0 0% 100%");
  });

  it("picks the label with the higher contrast", () => {
    for (const accentColor of ["#facc15", "#ff0000", "#1e3a8a", "#5865f2", "#27762e", "#7c3aed", "#14b8a6"]) {
      const label = (brandStyle({ accentColor }) as Record<string, string>)["--primary-foreground"];
      const chosen = label === "0 0% 100%" ? "#ffffff" : "#0e150e";
      const other = chosen === "#ffffff" ? "#0e150e" : "#ffffff";
      expect(contrastRatio(chosen, accentColor)).toBeGreaterThanOrEqual(contrastRatio(other, accentColor));
    }
  });
});

describe("contrastRatio", () => {
  it("knows the extremes and is symmetric", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 5);
    expect(contrastRatio("#27762e", "#ffffff")).toBeCloseTo(contrastRatio("#ffffff", "#27762e"), 10);
  });
});

describe("parseBranding", () => {
  it("keeps a valid accent color and drops junk", () => {
    expect(parseBranding({ accentColor: "#00E676" })).toEqual({ accentColor: "#00E676" });
    expect(parseBranding({ accentColor: "red" })).toEqual({});
    expect(parseBranding(null)).toEqual({});
  });
});
