import { describe, expect, it } from "vitest";

import { shopLegalUrl } from "./legal";
import { shopUrl } from "./shop-url";

describe("shopUrl", () => {
  it("uses the shop's English address with /en and its German words with /de", () => {
    expect(shopUrl("en", "/legal/dpa")).toBe("https://www.msk-scripts.de/en/legal/dpa");
    expect(shopUrl("de", "/legal/dpa")).toBe("https://www.msk-scripts.de/de/rechtliches/avv");
    expect(shopUrl("de", "/tools")).toBe("https://www.msk-scripts.de/de/web-tools");
    expect(shopUrl("en", "/")).toBe("https://www.msk-scripts.de/en");
    expect(shopUrl("de", "/")).toBe("https://www.msk-scripts.de/de");
  });

  it("sends the five languages the shop does not have to the English page", () => {
    for (const locale of ["hu", "fr", "es", "pt", "pl"]) {
      expect(shopUrl(locale, "/about")).toBe("https://www.msk-scripts.de/en/about");
    }
  });
});

describe("shopLegalUrl", () => {
  it("links the contract pages under the wording the law prescribes", () => {
    // § 356a and § 312k BGB: the German addresses carry the prescribed words.
    expect(shopLegalUrl("de", "/withdraw-contract")).toBe(
      "https://www.msk-scripts.de/de/vertrag-widerrufen",
    );
    expect(shopLegalUrl("de", "/cancel-contract")).toBe(
      "https://www.msk-scripts.de/de/vertrag-kuendigen",
    );
    expect(shopLegalUrl("en", "/cancel-contract")).toBe(
      "https://www.msk-scripts.de/en/cancel-contract",
    );
  });

  it("covers every page the footer and the dashboard link to", () => {
    const pages = {
      "/legal/terms": "/rechtliches/agb",
      "/legal/withdrawal": "/rechtliches/widerrufsbelehrung",
      "/legal/dpa": "/rechtliches/avv",
      "/withdraw-contract": "/vertrag-widerrufen",
      "/cancel-contract": "/vertrag-kuendigen",
      "/report": "/inhalt-melden",
    } as const;
    for (const [page, german] of Object.entries(pages)) {
      expect(shopLegalUrl("de", page as keyof typeof pages)).toBe(
        `https://www.msk-scripts.de/de${german}`,
      );
      expect(shopLegalUrl("pl", page as keyof typeof pages)).toBe(
        `https://www.msk-scripts.de/en${page}`,
      );
    }
  });
});
