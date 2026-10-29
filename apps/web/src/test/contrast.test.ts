import { describe, expect, it } from "vitest";

import { contrastRatio } from "../lib/branding";

import { CHANNELS, colorUtilities, over, resolveColor, sourceTokens } from "./tokens";

/**
 * Contrast of the design tokens against WCAG 2.2 AA, in both themes.
 *
 * The tokens come straight from app/globals.css (src/test/tokens.ts): the HSL
 * channels of the source tokens and the expressions of `@theme inline`,
 * including the hover fill and the soft surface that are mixed from
 * `--primary` in oklab. Every pair below is a combination that is rendered:
 * text (4.5:1) or a control border, focus ring or sign (3:1) on the surface it
 * sits on. A pair names the utility (`primary`, `accent-soft`), a literal
 * `#rrggbb`, or a colour at an opacity over a surface (`bg-primary/10`).
 *
 * Not measured in a browser on purpose: `color-mix()` comes back there as
 * `color(srgb …)`, and transitions freeze at their start value in headless
 * renderers. Both produce false findings.
 *
 * The coverage tests make sure no colour utility is left without a pair and
 * no source token is left without a utility, so a new colour cannot ship
 * untested. A customer's accent is not covered here: it is the customer's
 * choice, and brandVariables (lib/branding.ts) picks its label by contrast.
 */

type Ref = string | { over: [color: Ref, surface: Ref, opacity: number] };
type Pair = [label: string, fg: Ref, bg: Ref, need: number];

const tint = (color: string, surface: string, opacity: number): Ref => ({
  over: [color, surface, opacity],
});

const STATUS = ["success", "warning", "danger", "info"] as const;

const PAIRS: Pair[] = [
  // Ground, tile, card and the popover surfaces.
  ["Text on the ground", "foreground", "background", 4.5],
  ["Text on the tile", "foreground", "muted", 4.5],
  ["Text on a card", "card-foreground", "card", 4.5],
  ["Muted text on the ground", "muted-foreground", "background", 4.5],
  ["Muted text on the tile", "muted-foreground", "muted", 4.5],
  ["Muted text on a card", "muted-foreground", "card", 4.5],
  // Striped table rows mix the tile into the ground (legal texts).
  ["Muted text on a striped row", "muted-foreground", tint("muted", "background", 0.4), 4.5],
  ["Text in a popover", "popover-foreground", "popover", 4.5],
  ["Muted text in a popover", "muted-foreground", "popover", 4.5],
  // shadcn's hover surface (`hover:bg-accent`), the tile in this system.
  ["Text on the hover surface", "accent-foreground", "accent", 4.5],

  // The grey secondary button, at rest and on hover (it fills with the tile).
  ["Label on the secondary button", "secondary-foreground", "secondary", 4.5],
  ["Label on the hovered secondary button", "secondary-foreground", "muted", 4.5],

  // MSK green: fill with its label, and green text on every surface.
  ["Label on the primary fill", "primary-foreground", "primary", 4.5],
  ["Label on the primary hover fill", "primary-foreground", "primary-hover", 4.5],
  ["Green text on the ground", "primary", "background", 4.5],
  ["Green text on the tile", "primary", "muted", 4.5],
  ["Green text on a card", "primary", "card", 4.5],
  // Text links turn to the hover green while the pointer is on them.
  ["Hovered green link on the ground", "primary-hover", "background", 4.5],
  ["Hovered green link on a card", "primary-hover", "card", 4.5],
  // `bg-primary/10 text-primary`: badges and highlighted rows of the
  // existing pages.
  ["Green text on its tint over a card", "primary", tint("primary", "card", 0.1), 4.5],
  ["Green text on its tint over the ground", "primary", tint("primary", "background", 0.1), 4.5],

  // Soft green surface: the current nav item, a chosen radio card, tags.
  ["Text on the soft green surface", "foreground", "accent-soft", 4.5],
  ["Muted text on the soft green surface", "muted-foreground", "accent-soft", 4.5],
  ["Green text on the soft green surface", "primary", "accent-soft", 4.5],

  // Anthracite band and green band; both keep their colours in both themes.
  ["Text in the anthracite band", "band-foreground", "band", 4.5],
  ["Muted text in the anthracite band", "band-muted", "band", 4.5],
  ["Green text in the anthracite band", "band-accent", "band", 4.5],
  ["Label on green in the band", "band-accent-foreground", "band-accent", 4.5],
  ["Text in the green band", "brand-foreground", "brand", 4.5],
  ["Muted text in the green band", "brand-muted", "brand", 4.5],
  ["Label on the white button in the green band", "brand-button-foreground", "brand-button", 4.5],
  ["Label on the hovered button in the green band", "brand-button-foreground", "brand-muted", 4.5],

  // Controls (WCAG 1.4.11): field borders and the focus ring.
  ["Form control border on a card", "input", "card", 3],
  ["Form control border on the ground", "input", "background", 3],
  ["Focus ring on the ground", "ring", "background", 3],
  ["Focus ring on a card", "ring", "card", 3],

  // Status colours: word, sign and border on the ground, a card, the tile
  // (Notice) and their own tint (StatusBadge at 8 %, the 10 % here is the
  // stricter case).
  ...STATUS.flatMap((s): Pair[] => [
    [`Status ${s} on the ground`, s, "background", 4.5],
    [`Status ${s} on a card`, s, "card", 4.5],
    [`Status ${s} on the tile`, s, "muted", 4.5],
    [`Status ${s} on its tint over a card`, s, tint(s, "card", 0.1), 4.5],
    [`Status ${s} on its tint over the ground`, s, tint(s, "background", 0.1), 4.5],
  ]),
  // `destructive` is the same colour under its shadcn name, still used for
  // error text and destructive buttons on the existing pages.
  ["Error text on a card", "destructive", "card", 4.5],
  ["Error text on the ground", "destructive", "background", 4.5],
  ["Label on the destructive button", "destructive-foreground", "destructive", 4.5],
  ["Label on the danger button", "danger-foreground", "danger", 4.5],

  // Discord: the fill of Discord actions, and the mark beside them.
  ["White label on the Discord fill", "#ffffff", "discord", 4.5],
  ["Discord mark on a card", "discord", "card", 3],
  ["Discord mark on the ground", "discord", "background", 3],

  // Chart series: each label sits in the colour of its series on the tile or
  // a card.
  ...[1, 2, 3, 4, 5].flatMap((n): Pair[] => [
    [`Chart label ${n} on the tile`, `chart-${n}`, "muted", 4.5],
    [`Chart label ${n} on a card`, `chart-${n}`, "card", 4.5],
  ]),
];

/** Utilities that are hairlines only and never carry or sit under text. */
const LINES_ONLY = ["border", "band-line"];

const utilities = colorUtilities();
const tokens = sourceTokens();

function resolve(ref: Ref, theme: Record<string, string>): string {
  if (typeof ref !== "string") {
    const [color, surface, opacity] = ref.over;
    return over(resolve(color, theme), resolve(surface, theme), opacity);
  }
  if (ref.startsWith("#")) return ref;
  const expr = utilities[ref];
  if (!expr) throw new Error(`no colour utility "${ref}" in @theme inline`);
  return resolveColor(expr, theme);
}

function names(ref: Ref): string[] {
  if (typeof ref !== "string") return [...names(ref.over[0]), ...names(ref.over[1])];
  return ref.startsWith("#") ? [] : [ref];
}

describe.each([
  ["Light theme", tokens.light],
  ["Dark theme", tokens.dark],
])("%s: contrast reaches WCAG AA", (_name, theme) => {
  it.each(PAIRS)("%s", (_label, fg, bg, need) => {
    expect(contrastRatio(resolve(fg, theme), resolve(bg, theme))).toBeGreaterThanOrEqual(need);
  });
});

describe("Coverage", () => {
  const covered = new Set(PAIRS.flatMap(([, fg, bg]) => [...names(fg), ...names(bg)]));

  it("every colour utility of globals.css is in at least one pair", () => {
    const missing = Object.keys(utilities).filter(
      (name) => !covered.has(name) && !LINES_ONLY.includes(name),
    );
    expect(missing).toEqual([]);
  });

  it("every utility a pair names exists", () => {
    expect([...covered].filter((name) => !(name in utilities))).toEqual([]);
  });

  it("every colour source token is read by a utility", () => {
    const read = Object.values(utilities).join(" ");
    const orphans = Object.entries(tokens.light)
      .filter(([, value]) => CHANNELS.test(value))
      .map(([name]) => name)
      .filter((name) => !read.includes(`var(--${name})`));
    expect(orphans).toEqual([]);
  });
});

describe("The derived accent shades", () => {
  it("hover lands on the shop's hover green in light", () => {
    expect(resolve("primary-hover", tokens.light)).toBe("#1d5e23");
  });

  it("source tokens round-trip to the shop's values", () => {
    expect(resolve("primary", tokens.light)).toBe("#27762e");
    expect(resolve("primary", tokens.dark)).toBe("#6dbb3d");
    expect(resolve("background", tokens.light)).toBe("#f6f6f4");
    expect(resolve("background", tokens.dark)).toBe("#18191b");
  });
});
