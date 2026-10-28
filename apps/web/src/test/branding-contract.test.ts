import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import tailwind from "@tailwindcss/postcss";
import postcss from "postcss";
import { describe, expect, it } from "vitest";

import { brandProps, GUILD_ACCENT_ATTRIBUTE } from "../lib/branding";

/**
 * The customer branding contract (DESIGN.md, "Customer branding").
 *
 * A public page sets `--primary` and `--ring` as HSL channels on its wrapper
 * (`brandStyle` in lib/branding.ts), and Pro customers override the same
 * variables in custom CSS against `.msk-form`. That only recolours the page
 * when every utility resolves the variable on the element that uses it. A
 * utility that reads `var(--color-primary)` gets the value computed on :root
 * and ignores the wrapper, which is what happened after the move to
 * Tailwind CSS 4 until the colour block became `@theme inline`.
 *
 * The test compiles the real globals.css with the real Tailwind and looks at
 * the rules it emits, so it cannot pass on a copy that drifted apart.
 */

const APP_DIR = fileURLToPath(new URL("../app/", import.meta.url));
const SRC_DIR = fileURLToPath(new URL("../", import.meta.url));
const UI_DIR = fileURLToPath(new URL("../../../../packages/ui/src/", import.meta.url));
const CSS = readFileSync(join(APP_DIR, "globals.css"), "utf8");

/** Utility and the value it must carry so that a wrapper override reaches it. */
const BRANDABLE: [utility: string, expected: string][] = [
  ["bg-primary", "hsl(var(--primary))"],
  ["text-primary", "hsl(var(--primary))"],
  ["border-primary", "hsl(var(--primary))"],
  ["text-primary-foreground", "hsl(var(--primary-foreground))"],
  ["ring-ring", "hsl(var(--ring))"],
  ["bg-background", "hsl(var(--background))"],
  ["bg-card", "hsl(var(--card))"],
  ["text-foreground", "hsl(var(--foreground))"],
  ["text-muted-foreground", "hsl(var(--muted-foreground))"],
  ["border-input", "hsl(var(--input))"],
  ["border-border", "hsl(var(--border))"],
  ["rounded-lg", "var(--radius)"],
  ["rounded-md", "var(--radius)"],
  ["rounded-sm", "var(--radius)"],
];

async function compile(utilities: string[]): Promise<string> {
  // No source scanning: only the utilities named here are generated, which
  // keeps the run fast and the output small.
  const input = CSS.replace(/@import\s+["']tailwindcss["'];/, '@import "tailwindcss" source(none);')
    .replace(/^@source\s[^;]*;$/gm, "")
    .concat(`\n@source inline("${utilities.join(" ")}");\n`);
  const result = await postcss([tailwind()]).process(input, { from: join(APP_DIR, "globals.css") });
  return result.css;
}

/** Body of the first rule whose selector is exactly `.utility`. */
function ruleBody(css: string, utility: string): string {
  const selector = `.${utility.replace(/[/:]/g, (c) => `\\${c}`)} {`;
  const start = css.indexOf(selector);
  expect(start, `no rule for .${utility}`).toBeGreaterThan(-1);
  return css.slice(start, css.indexOf("}", start));
}

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.(tsx?|css)$/.test(name) && !/\.test\.tsx?$/.test(name) ? [path] : [];
  });
}

describe("customer branding contract", () => {
  it.each(BRANDABLE)("%s resolves the variable on the element", async (utility, expected) => {
    const css = await compile([utility]);
    expect(ruleBody(css, utility)).toContain(expected);
  });

  it("brandProps sets channels that the accent rule of globals.css reads", () => {
    const style = brandProps({ accentColor: "#3366cc" }).style as Record<string, string>;
    for (const [name, value] of Object.entries(style)) {
      expect(value, name).toMatch(/^-?[\d.]+\s+[\d.]+%\s+[\d.]+%$/);
      expect(CSS, `${name} is not read by globals.css`).toContain(`var(${name})`);
    }
  });

  it("maps the accent in a cascade layer, so unlayered custom CSS wins", async () => {
    // A customer's `.msk-form { --primary: … }` arrives in an unlayered
    // <style>. It beats the accent (and its readable fallback) only while the
    // rules that set --primary from the accent sets are inside a layer.
    const css = await compile([]);
    const root = postcss.parse(css);
    const accentRules: postcss.Rule[] = [];
    root.walkRules((rule) => {
      if (rule.selector.includes(`[${GUILD_ACCENT_ATTRIBUTE}]`)) accentRules.push(rule);
    });
    expect(accentRules.length).toBeGreaterThan(0);
    for (const rule of accentRules) {
      let layered = false;
      for (
        let p: postcss.Node | undefined = rule.parent as postcss.Node | undefined;
        p;
        p = p.parent as postcss.Node | undefined
      ) {
        if (p.type === "atrule" && (p as postcss.AtRule).name === "layer") layered = true;
      }
      expect(layered, `${rule.selector} is not in a cascade layer`).toBe(true);
    }
    const setsPrimary = accentRules.filter((rule) =>
      rule.nodes.some((n) => n.type === "decl" && n.prop === "--primary"),
    );
    expect(setsPrimary.map((r) => r.selector).sort()).toEqual([
      `.dark [${GUILD_ACCENT_ATTRIBUTE}]`,
      `[${GUILD_ACCENT_ATTRIBUTE}]`,
    ]);
  });

  it("no source file reads a theme colour through var(--color-…)", () => {
    // `var(--color-primary)` is computed on :root and ignores a wrapper's
    // `--primary`. Utilities (`bg-primary`) or `hsl(var(--primary))` do not.
    const offenders = [...sourceFiles(SRC_DIR), ...sourceFiles(UI_DIR)].filter((path) =>
      /var\(--color-/.test(readFileSync(path, "utf8")),
    );
    expect(offenders).toEqual([]);
  });
});
