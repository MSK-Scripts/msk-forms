import { describe, expect, it } from "vitest";

import { isUuid } from "./uuid";

describe("isUuid", () => {
  it("accepts a canonical uuid in either case", () => {
    expect(isUuid("8f0c1a52-3c3e-4b8e-9d55-0d3c2a1b4e01")).toBe(true);
    expect(isUuid("8F0C1A52-3C3E-4B8E-9D55-0D3C2A1B4E01")).toBe(true);
  });

  it("rejects anything else", () => {
    for (const value of [
      "not-a-uuid",
      "",
      "8f0c1a523c3e4b8e9d550d3c2a1b4e01",
      "8f0c1a52-3c3e-4b8e-9d55-0d3c2a1b4e01x",
      "../etc/passwd",
    ]) {
      expect(isUuid(value)).toBe(false);
    }
  });
});
