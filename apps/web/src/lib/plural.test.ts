import { describe, expect, it } from "vitest";

import { countForm } from "./plural";

const pl = { one: "zgłoszenie", few: "zgłoszenia", other: "zgłoszeń" };
const en = { one: "submission", few: "submissions", other: "submissions" };

describe("countForm", () => {
  it("picks the Polish form for 1, 2 to 4 and 5 and up", () => {
    expect(countForm(1, "pl", pl)).toBe("zgłoszenie");
    for (const n of [2, 3, 4, 22, 34]) expect(countForm(n, "pl", pl)).toBe("zgłoszenia");
    for (const n of [5, 11, 12, 13, 14, 25, 100]) expect(countForm(n, "pl", pl)).toBe("zgłoszeń");
  });

  it("keeps singular and plural in English", () => {
    expect(countForm(1, "en", en)).toBe("submission");
    expect(countForm(3, "en", en)).toBe("submissions");
  });
});
