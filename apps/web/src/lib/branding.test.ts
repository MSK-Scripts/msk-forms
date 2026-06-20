import { describe, expect, it } from "vitest";

import { brandStyle, hexToHslChannels, parseBranding } from "./branding";

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

  it("overrides the primary + ring tokens", () => {
    expect(brandStyle({ accentColor: "#ff0000" })).toEqual({
      "--primary": "0 100% 50%",
      "--ring": "0 100% 50%",
    });
  });
});

describe("parseBranding", () => {
  it("keeps a valid accent color and drops junk", () => {
    expect(parseBranding({ accentColor: "#00E676" })).toEqual({ accentColor: "#00E676" });
    expect(parseBranding({ accentColor: "red" })).toEqual({});
    expect(parseBranding(null)).toEqual({});
  });
});
