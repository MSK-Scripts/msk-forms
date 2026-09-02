import { describe, expect, it } from "vitest";

import { buildOrderConfirmation, pickMailLang } from "./order-confirmation";

const base = {
  planLabel: "Pro",
  guildLabel: "Testserver",
  price: "4,99 €",
  dashboardUrl: "https://forms.msk-scripts.de/dashboard/abc/forms",
};

describe("pickMailLang", () => {
  it("picks German only when the customer says so", () => {
    expect(pickMailLang(["de-DE", "en"])).toBe("de");
    expect(pickMailLang(["de"])).toBe("de");
    expect(pickMailLang(["en-GB"])).toBe("en");
    expect(pickMailLang([])).toBe("en");
    expect(pickMailLang(null)).toBe("en");
    expect(pickMailLang(undefined)).toBe("en");
  });
});

describe("buildOrderConfirmation", () => {
  it("names service, price and term, which is what § 312f asks for", () => {
    const mail = buildOrderConfirmation({ lang: "de", ...base });
    expect(mail.subject).toContain("MSK Forms Pro");
    expect(mail.subject).toContain("Testserver");
    expect(mail.text).toContain("4,99 €");
    expect(mail.text).toContain("§ 19 UStG");
    expect(mail.text).toContain("verlängert sich monatlich");
  });

  it("links the withdrawal, cancellation and DPA pages on the shop domain", () => {
    const de = buildOrderConfirmation({ lang: "de", ...base });
    for (const url of [
      "https://www.msk-scripts.de/de/vertrag-kuendigen",
      "https://www.msk-scripts.de/de/vertrag-widerrufen",
      "https://www.msk-scripts.de/de/terms/widerruf",
      "https://www.msk-scripts.de/de/terms/avv",
      "https://www.msk-scripts.de/de/terms",
    ]) {
      expect(de.text).toContain(url);
      expect(de.html).toContain(url);
    }
  });

  it("uses the English pages for every non-German locale", () => {
    const en = buildOrderConfirmation({ lang: "en", ...base });
    expect(en.text).toContain("https://www.msk-scripts.de/vertrag-kuendigen");
    expect(en.text).not.toContain("/de/vertrag-kuendigen");
  });

  it("carries the dashboard link", () => {
    const mail = buildOrderConfirmation({ lang: "en", ...base });
    expect(mail.text).toContain(base.dashboardUrl);
    expect(mail.html).toContain(base.dashboardUrl);
  });

  it("escapes the guild name, which is foreign input", () => {
    const mail = buildOrderConfirmation({
      lang: "en",
      ...base,
      guildLabel: "<script>alert(1)</script>",
    });
    expect(mail.html).not.toContain("<script>");
    expect(mail.html).toContain("&lt;script&gt;");
    // The plain-text part is not markup, so it keeps the raw name.
    expect(mail.text).toContain("<script>alert(1)</script>");
  });

  it("says Enterprise when that is the plan", () => {
    const mail = buildOrderConfirmation({ lang: "en", ...base, planLabel: "Enterprise" });
    expect(mail.subject).toContain("MSK Forms Enterprise");
    expect(mail.text).toContain("Service: MSK Forms Enterprise");
  });
});
