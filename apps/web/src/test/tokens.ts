import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

/**
 * Reads the design tokens straight from app/globals.css for the token tests
 * (contrast, preview sync), so they check the real values and not a copy that
 * drifts apart.
 */

export const GLOBALS_CSS = readFileSync(
  fileURLToPath(new URL("../app/globals.css", import.meta.url)),
  "utf8",
);

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Custom property declarations of every block that opens with exactly
 * `selector {` at the start of a line, merged in order. `:root, .dark {`
 * (the more-contrast override) does not match `:root` or `.dark` on purpose.
 */
export function blockDeclarations(css: string, selector: string): Record<string, string> {
  const plain = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const out: Record<string, string> = {};
  const block = new RegExp(`^\\s*${escapeRegExp(selector)}\\s*\\{([^}]*)\\}`, "gm");
  for (const [, body] of plain.matchAll(block)) {
    for (const [, name, value] of body!.matchAll(/--([a-z0-9-]+)\s*:\s*([^;]+);/g))
      out[name!] = value!.trim();
  }
  return out;
}

/** Source tokens per theme; dark overrides some of them and inherits the rest. */
export function sourceTokens(css: string = GLOBALS_CSS) {
  const light = blockDeclarations(css, ":root");
  const dark = { ...light, ...blockDeclarations(css, ".dark") };
  return { light, dark };
}

/** Colour utilities of `@theme inline`: `primary` → `hsl(var(--primary))`. */
export function colorUtilities(css: string = GLOBALS_CSS): Record<string, string> {
  const all = blockDeclarations(css, "@theme inline");
  return Object.fromEntries(
    Object.entries(all)
      .filter(([name]) => name.startsWith("color-"))
      .map(([name, value]) => [name.slice("color-".length), value]),
  );
}

export const CHANNELS = /^(-?[\d.]+)\s+([\d.]+)%\s+([\d.]+)%$/;

type Rgb = [number, number, number];

const toHex = (rgb: Rgb) =>
  "#" +
  rgb
    .map((v) =>
      Math.round(Math.min(1, Math.max(0, v)) * 255)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("");
const fromHex = (hex: string): Rgb =>
  (hex.slice(1).match(/../g) ?? []).map((x) => parseInt(x, 16) / 255) as Rgb;

function hslToHex(channels: string): string {
  const m = CHANNELS.exec(channels);
  if (!m) throw new Error(`not HSL channels: ${channels}`);
  const [h, s, l] = [Number(m[1]), Number(m[2]) / 100, Number(m[3]) / 100];
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
  };
  return toHex([f(0), f(8), f(4)]);
}

const lin = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const delin = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

function toOklab(hex: string): Rgb {
  const [r, g, b] = fromHex(hex).map(lin) as Rgb;
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
  return toHex(
    [
      4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
      -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
      -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
    ].map(delin) as Rgb,
  );
}

/** `color-mix(in oklab, a p, b)` of two opaque colours. */
export function mixOklab(a: string, b: string, p: number): string {
  const [A, B] = [toOklab(a), toOklab(b)];
  return fromOklab(A.map((v, i) => v * p + B[i]! * (1 - p)) as Rgb);
}

/**
 * A colour at `p` opacity over a surface, as Tailwind's `bg-x/10` renders it:
 * mixing with `transparent` keeps the colour and lowers its alpha, and the
 * browser composites that over the surface in sRGB.
 */
export function over(color: string, surface: string, p: number): string {
  const [A, B] = [fromHex(color), fromHex(surface)];
  return toHex(A.map((v, i) => v * p + B[i]! * (1 - p)) as Rgb);
}

const MIX = /^color-mix\(in oklab,\s*(.+?)\s+(var\(--[a-z0-9-]+\)|[\d.]+%),\s*(.+)\)$/;

/**
 * Resolves a colour expression of globals.css to `#rrggbb` against one theme's
 * tokens. Knows the forms the file uses; anything else throws, so a new form
 * gets taught to the test instead of being skipped.
 */
export function resolveColor(expr: string, tokens: Record<string, string>): string {
  const e = expr.trim();
  let m: RegExpExecArray | null;
  if (/^#[0-9a-fA-F]{6}$/.test(e)) return e.toLowerCase();
  if ((m = /^hsl\(var\(--([a-z0-9-]+)\)\)$/.exec(e))) {
    const value = tokens[m[1]!];
    if (value === undefined) throw new Error(`token --${m[1]} missing`);
    return hslToHex(value);
  }
  if ((m = /^var\(--([a-z0-9-]+)\)$/.exec(e))) {
    const value = tokens[m[1]!];
    if (value === undefined) throw new Error(`token --${m[1]} missing`);
    return resolveColor(value, tokens);
  }
  if ((m = MIX.exec(e))) {
    const amount = m[2]!.startsWith("var(") ? tokens[m[2]!.slice(6, -1)] : m[2];
    if (!amount?.endsWith("%")) throw new Error(`no percentage for ${m[2]}`);
    return mixOklab(
      resolveColor(m[1]!, tokens),
      resolveColor(m[3]!, tokens),
      Number.parseFloat(amount) / 100,
    );
  }
  throw new Error(`unsupported colour expression: ${e}`);
}
