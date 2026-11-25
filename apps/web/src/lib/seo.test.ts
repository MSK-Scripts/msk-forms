import { describe, expect, it } from "vitest";

import { dictionaries } from "@/i18n/dictionaries";
import { productLines } from "@/components/site/navigation";
import nextConfig from "../../next.config";

import { META_DESCRIPTION_MAX, metaExcerpt } from "./seo";

describe("metaExcerpt", () => {
  it("turns Markdown into plain text", () => {
    expect(metaExcerpt("## Apply **now**\n\nSee [the rules](https://x.test).")).toBe(
      "Apply now See the rules.",
    );
  });

  it("stays inside what a search result shows", () => {
    const long = "word ".repeat(80);
    const text = metaExcerpt(long);
    expect(text.length).toBeLessThanOrEqual(META_DESCRIPTION_MAX);
    expect(text.endsWith("…")).toBe(true);
  });

  it("gives an empty string for nothing, so the caller's fallback applies", () => {
    expect(metaExcerpt(null)).toBe("");
    expect(metaExcerpt("  ")).toBe("");
  });
});

/**
 * Crawl of 25.11.2026: metadata streamed after </head> for user agents outside
 * Next's bot list, and the build assets had none of the security headers.
 */
describe("next.config", () => {
  it("blocks on metadata for every user agent", () => {
    const bots = nextConfig.htmlLimitedBots as RegExp;
    for (const ua of ["Mozilla/5.0 Chrome/142.0", "OpenSpider/1.0", ""])
      expect(bots.test(ua)).toBe(true);
  });

  it("sends the security headers with static files and optimised images", async () => {
    const rules = await nextConfig.headers!();
    for (const source of ["/_next/static/:path*", "/_next/image"]) {
      const keys = rules.find((r) => r.source === source)?.headers.map((h) => h.key) ?? [];
      expect(keys, source).toEqual(
        expect.arrayContaining([
          "Strict-Transport-Security",
          "X-Content-Type-Options",
          "X-Frame-Options",
          "Referrer-Policy",
        ]),
      );
    }
  });
});

describe("shop navigation", () => {
  it("links no shop address that only redirects since the scripts went free", () => {
    for (const locale of ["en", "de"] as const) {
      const fivem = productLines(dictionaries[locale].site, locale).find((l) => l.id === "fivem")!;
      const hrefs = [fivem.href, ...fivem.links.map((l) => l.href)];
      expect(
        hrefs.some((h) => /\/fivem$|all-access|alle-scripts/.test(h)),
        hrefs.join(" "),
      ).toBe(false);
    }
  });
});
