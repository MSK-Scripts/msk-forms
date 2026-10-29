/**
 * Colour math for the customer accent (lib/branding.ts): conversions between
 * `#rrggbb`, HSL and OKLab, the WCAG 2.2 contrast ratio and CIE XYZ.
 *
 * Pure and dependency-free, so it runs on the server, in the browser (the
 * custom CSS preview) and in the tests alike.
 */

export type Rgb = [number, number, number];

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** `#rrggbb` to channels in 0..1, or null for anything else. */
export function hexToRgb(hex: string): Rgb | null {
  const match = /^#([0-9a-fA-F]{6})$/.exec(hex);
  if (!match) return null;
  const int = parseInt(match[1]!, 16);
  return [((int >> 16) & 255) / 255, ((int >> 8) & 255) / 255, (int & 255) / 255];
}

/** Channels in 0..1 to `#rrggbb`, rounded to 8 bit as a screen shows them. */
export function rgbToHex(rgb: Rgb): string {
  return (
    "#" +
    rgb
      .map((v) =>
        Math.round(clamp01(v) * 255)
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")
  );
}

/** Hue in degrees, saturation and lightness in percent. */
export interface Hsl {
  h: number;
  s: number;
  l: number;
}

export function rgbToHsl([r, g, b]: Rgb): Hsl {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  let h = 0;
  let s = 0;
  if (d !== 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h /= 6;
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

export function hslToRgb({ h, s, l }: Hsl): Rgb {
  const sat = s / 100;
  const light = l / 100;
  const a = sat * Math.min(light, 1 - light);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    return light - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
  };
  return [f(0), f(8), f(4)];
}

/** The `H S% L%` channel triplet of the theme tokens, one decimal each. */
export function hslChannels({ h, s, l }: Hsl): string {
  const one = (v: number) => String(Math.round(v * 10) / 10);
  return `${one(h)} ${one(s)}% ${one(l)}%`;
}

/** Parses an `H S% L%` triplet back, or null. */
export function parseHslChannels(channels: string): Hsl | null {
  const m = /^(-?[\d.]+)\s+([\d.]+)%\s+([\d.]+)%$/.exec(channels.trim());
  return m ? { h: Number(m[1]), s: Number(m[2]), l: Number(m[3]) } : null;
}

/** The colour a browser paints for an `H S% L%` triplet, as `#rrggbb`. */
export function channelsToHex(channels: string): string | null {
  const hsl = parseHslChannels(channels);
  return hsl ? rgbToHex(hslToRgb(hsl)) : null;
}

const linear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const gamma = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

/** WCAG relative luminance of a `#rrggbb` colour. */
export function luminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) throw new Error(`not a #rrggbb colour: ${hex}`);
  const [r, g, b] = rgb.map(linear) as Rgb;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG 2.2 contrast ratio of two `#rrggbb` colours. */
export function contrastRatio(a: string, b: string): number {
  const [x, y] = [luminance(a), luminance(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

/**
 * CIE XYZ (D65) of a `#rrggbb` colour, as CSS `color(from … xyz-d65 x y z)`
 * sees it. `y` is the relative luminance.
 */
export function toXyzD65(hex: string): Rgb {
  const rgb = hexToRgb(hex);
  if (!rgb) throw new Error(`not a #rrggbb colour: ${hex}`);
  const [r, g, b] = rgb.map(linear) as Rgb;
  return [
    0.41239079926595934 * r + 0.357584339383878 * g + 0.1804807884018343 * b,
    0.21263900587151027 * r + 0.715168678767756 * g + 0.07219231536073371 * b,
    0.01933081871559182 * r + 0.11919477979462598 * g + 0.9505321522496607 * b,
  ];
}

function toOklab(hex: string): Rgb {
  const [r, g, b] = (hexToRgb(hex) ?? [0, 0, 0]).map(linear) as Rgb;
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

function fromOklab([L, a, b]: Rgb): string {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return rgbToHex(
    [
      4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
      -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
      -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
    ].map(gamma) as Rgb,
  );
}

/**
 * The nearest colour of the same hue and saturation that reaches `min` by
 * `contrast`, worked out on the one-decimal channel triplet a page receives,
 * so what is measured is what is painted: the colour itself where it already
 * reaches `min`, else its lightness moved in steps of 0.1 % (down for
 * `darker`, up for `lighter`) until it reaches `min + margin`. The margin
 * keeps 8-bit rounding from putting the result back below. Black and white
 * end the search, so it always returns.
 */
export function shiftLightness(
  hex: string,
  contrast: (hex: string) => number,
  min: number,
  direction: "darker" | "lighter",
  margin = 0,
): Hsl {
  const rgb = hexToRgb(hex);
  if (!rgb) throw new Error(`not a #rrggbb colour: ${hex}`);
  const round = (v: number) => Math.round(v * 10) / 10;
  const own = rgbToHsl(rgb);
  const start: Hsl = { h: round(own.h), s: round(own.s), l: round(own.l) };
  const paint = (hsl: Hsl) => rgbToHex(hslToRgb(hsl));

  if (contrast(paint(start)) >= min) return start;

  const step = direction === "darker" ? -0.1 : 0.1;
  for (let l = start.l; l >= 0 && l <= 100; l = round(l + step)) {
    const candidate = { ...start, l };
    if (contrast(paint(candidate)) >= min + margin) return candidate;
  }
  return { ...start, l: direction === "darker" ? 0 : 100 };
}

/** `color-mix(in oklab, a p, b)` of two opaque colours, `p` in 0..1. */
export function mixOklab(a: string, b: string, p: number): string {
  const [A, B] = [toOklab(a), toOklab(b)];
  return fromOklab(A.map((v, i) => v * p + B[i]! * (1 - p)) as Rgb);
}
