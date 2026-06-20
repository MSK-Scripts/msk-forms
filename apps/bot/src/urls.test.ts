import { describe, expect, it } from "vitest";

import { dashboardUrl, formUrl, statusUrl } from "./urls.js";

describe("url builders", () => {
  it("builds form and status links", () => {
    expect(formUrl("https://forms.msk-scripts.de", "apply")).toBe(
      "https://forms.msk-scripts.de/f/apply",
    );
    expect(statusUrl("https://forms.msk-scripts.de", "abc-123")).toBe(
      "https://forms.msk-scripts.de/s/abc-123",
    );
  });

  it("scopes the dashboard link to a guild when given", () => {
    expect(dashboardUrl("https://x.de")).toBe("https://x.de/dashboard");
    expect(dashboardUrl("https://x.de", "g1")).toBe("https://x.de/dashboard/g1/forms");
  });

  it("normalises a trailing slash on the base", () => {
    expect(formUrl("http://localhost:3000/", "s")).toBe("http://localhost:3000/f/s");
  });
});
