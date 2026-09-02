import { describe, expect, it } from "vitest";

import { shopLegalUrl } from "./legal";

describe("shopLegalUrl", () => {
  it("prefixes German with /de and leaves every other locale on the root", () => {
    expect(shopLegalUrl("de", "/vertrag-kuendigen")).toBe(
      "https://www.msk-scripts.de/de/vertrag-kuendigen",
    );
    expect(shopLegalUrl("en", "/vertrag-kuendigen")).toBe(
      "https://www.msk-scripts.de/vertrag-kuendigen",
    );
    // The shop only has English and German, so the five remaining locales of
    // this app land on the English page rather than a 404.
    for (const locale of ["hu", "fr", "es", "pt", "pl"]) {
      expect(shopLegalUrl(locale, "/terms/avv")).toBe("https://www.msk-scripts.de/terms/avv");
    }
  });

  it("covers every page the footer and the mail link to", () => {
    const pages = [
      "/terms",
      "/terms/widerruf",
      "/terms/avv",
      "/vertrag-widerrufen",
      "/vertrag-kuendigen",
      "/report",
    ] as const;
    for (const page of pages) {
      expect(shopLegalUrl("de", page)).toBe(`https://www.msk-scripts.de/de${page}`);
    }
  });
});
