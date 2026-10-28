import { describe, expect, it } from "vitest";

import { sourceTokens } from "../test/tokens";

import {
  accentContrast,
  accentSets,
  brandProps,
  contrastRatio,
  GUILD_ACCENT_ATTRIBUTE,
  hexToHslChannels,
  LABELS,
  labelFor,
  parseBranding,
  readableAccent,
  TEXT_CONTRAST,
  THEME_SURFACES,
  UI_CONTRAST,
  type Theme,
} from "./branding";
import { channelsToHex, hslChannels, mixOklab, toXyzD65 } from "./color";
import { GUILD_ACCENT_CSS } from "./guild-accent-css";

const THEMES: Theme[] = ["light", "dark"];

/** Accents customers pick, from the brief's cases to the extremes. */
const ACCENTS = [
  "#27762e", // MSK green, light theme value
  "#6dbb3d", // MSK green, dark theme value
  "#1e3a8a", // dark navy: fails on the dark ground
  "#facc15", // yellow: fails as text on white
  "#ff0000",
  "#5865f2",
  "#7c3aed",
  "#14b8a6",
  "#00e676",
  "#000000",
  "#ffffff",
  "#808080",
];

describe("hexToHslChannels", () => {
  it("converts primary colors with one decimal like the tokens", () => {
    expect(hexToHslChannels("#000000")).toBe("0 0% 0%");
    expect(hexToHslChannels("#ffffff")).toBe("0 0% 100%");
    expect(hexToHslChannels("#ff0000")).toBe("0 100% 50%");
    expect(hexToHslChannels("#27762e")).toBe("125.3 50.3% 30.8%");
  });

  it("rejects malformed hex", () => {
    expect(hexToHslChannels("00E676")).toBeNull();
    expect(hexToHslChannels("#fff")).toBeNull();
  });
});

describe("theme surfaces", () => {
  it("match the source tokens of globals.css", () => {
    const tokens = sourceTokens();
    for (const theme of THEMES) {
      expect(THEME_SURFACES[theme].background).toBe(channelsToHex(tokens[theme].background!));
      expect(THEME_SURFACES[theme].card).toBe(channelsToHex(tokens[theme].card!));
      expect(THEME_SURFACES[theme].muted).toBe(channelsToHex(tokens[theme].muted!));
      expect(THEME_SURFACES[theme].softAmount).toBeCloseTo(Number.parseFloat(tokens[theme]["accent-soft-amount"]!) / 100, 10);
    }
  });
});

describe("readable fallback accent", () => {
  it.each(ACCENTS)("%s reaches text contrast on every surface of both themes", (hex) => {
    const sets = accentSets(hex)!;
    for (const theme of THEMES) {
      const shown = channelsToHex(sets[theme].accent)!;
      expect(accentContrast(shown, theme), `${hex} in ${theme}`).toBeGreaterThanOrEqual(TEXT_CONTRAST);
      // Fills and focus rings need 3:1 against the ground; text implies it.
      expect(contrastRatio(shown, THEME_SURFACES[theme].background)).toBeGreaterThanOrEqual(UI_CONTRAST);
    }
  });

  it("keeps a colour that passes and adjusts only the theme it fails in", () => {
    // MSK green of the light theme reads on light surfaces, not on anthracite.
    const green = accentSets("#27762e")!;
    expect(green.light).toMatchObject({ accent: "125.3 50.3% 30.8%", adjusted: false });
    expect(green.dark.adjusted).toBe(true);

    const navy = accentSets("#1e3a8a")!;
    expect(navy.light.adjusted).toBe(false);
    expect(navy.dark.adjusted).toBe(true);

    const yellow = accentSets("#facc15")!;
    expect(yellow.light.adjusted).toBe(true);
    expect(yellow.dark.adjusted).toBe(false);
  });

  it("keeps hue and saturation and moves lightness the readable way", () => {
    for (const hex of ACCENTS) {
      const own = readableAccent(hex, "light", 0);
      for (const theme of THEMES) {
        const shown = readableAccent(hex, theme);
        expect(shown.h).toBe(own.h);
        expect(shown.s).toBe(own.s);
        if (theme === "light") expect(shown.l).toBeLessThanOrEqual(own.l);
        else expect(shown.l).toBeGreaterThanOrEqual(own.l);
      }
    }
  });

  it("stays as close to the customer's colour as the margin allows", () => {
    // One step back toward the original must fail the target again, or the
    // fallback moved further than it had to.
    for (const hex of ["#facc15", "#1e3a8a", "#27762e"]) {
      for (const theme of THEMES) {
        const shown = readableAccent(hex, theme);
        const own = readableAccent(hex, theme, 0);
        if (shown.l === own.l) continue;
        const back = { ...shown, l: Math.round((shown.l + (theme === "light" ? 0.1 : -0.1)) * 10) / 10 };
        expect(accentContrast(channelsToHex(hslChannels(back))!, theme)).toBeLessThan(TEXT_CONTRAST + 0.1);
      }
    }
  });

  it("measures the soft surface, not only the ground", () => {
    const { background, softAmount } = THEME_SURFACES.light;
    const soft = mixOklab("#27762e", background, softAmount);
    expect(accentContrast("#27762e", "light")).toBeCloseTo(contrastRatio("#27762e", soft), 10);
  });
});

describe("label", () => {
  it("is chosen for the accent each theme shows, not for the customer's colour", () => {
    // Yellow wants the dark label, its light-theme fallback (dark ochre) the
    // white one. A label computed from the original colour would fail there.
    const yellow = accentSets("#facc15")!;
    expect(yellow.light.label).toBe("0 0% 100%");
    expect(yellow.dark.label).toBe("120 20% 6.9%");
    const navy = accentSets("#1e3a8a")!;
    expect(navy.light.label).toBe("0 0% 100%");
    expect(navy.dark.label).toBe("120 20% 6.9%");
  });

  it.each(ACCENTS)("on %s reaches 4.5:1 in both themes", (hex) => {
    const sets = accentSets(hex)!;
    for (const theme of THEMES) {
      const accent = channelsToHex(sets[theme].accent)!;
      const label = channelsToHex(sets[theme].label)!;
      expect(contrastRatio(label, accent), `${hex} in ${theme}`).toBeGreaterThanOrEqual(TEXT_CONTRAST);
    }
  });

  it("picks the label with the higher contrast", () => {
    for (const hex of ACCENTS) {
      const chosen = labelFor(hex).hex;
      const other = chosen === "#ffffff" ? "#0e150e" : "#ffffff";
      expect(contrastRatio(chosen, hex)).toBeGreaterThanOrEqual(contrastRatio(other, hex));
    }
  });

  it("is computed in CSS with the same threshold and labels", () => {
    // globals.css derives --primary-foreground from --primary with relative
    // colours, so a customer's own --primary gets the right label too. Its
    // constants must make the choice labelFor makes.
    const [white, dark] = LABELS.map((l) => toXyzD65(l.hex));
    const threshold = Math.sqrt(1.05 * (dark![1] + 0.05)) - 0.05;
    const calcs = [...GUILD_ACCENT_CSS.matchAll(/calc\(([\d.]+) \+ ([\d.]+) \* clamp\(0, \(([\d.]+) - y\) \* 1000000, 1\)\)/g)];
    expect(calcs).toHaveLength(3);
    calcs.forEach(([, base, span, t], i) => {
      expect(Number(base)).toBeCloseTo(dark![i]!, 4);
      expect(Number(base) + Number(span)).toBeCloseTo(white![i]!, 3);
      expect(Number(t)).toBeCloseTo(threshold, 4);
    });
  });
});

describe("brandProps", () => {
  it("is empty without an accent color", () => {
    expect(brandProps({})).toEqual({});
  });

  it("sets both theme sets and the attribute the rule selects on", () => {
    const props = brandProps({ accentColor: "#facc15" });
    expect(props[GUILD_ACCENT_ATTRIBUTE]).toBe("");
    const sets = accentSets("#facc15")!;
    expect(props.style).toEqual({
      "--guild-accent-light": sets.light.accent,
      "--guild-accent-light-label": sets.light.label,
      "--guild-accent-dark": sets.dark.accent,
      "--guild-accent-dark-label": sets.dark.label,
    });
  });

  it("never sets --primary inline, where it would beat the customer's custom CSS", () => {
    for (const accentColor of ACCENTS) {
      const names = Object.keys(brandProps({ accentColor }).style ?? {});
      expect(names.filter((n) => ["--primary", "--primary-foreground", "--ring"].includes(n))).toEqual([]);
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
