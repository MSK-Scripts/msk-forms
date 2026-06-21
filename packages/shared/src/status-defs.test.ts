import { describe, expect, it } from "vitest";

import { statusDefsSchema } from "./status-defs.js";

describe("statusDefsSchema", () => {
  const valid = { key: "shortlisted", label: "Shortlisted", color: "#00E676" };

  it("accepts a well-formed list and applies defaults", () => {
    const r = statusDefsSchema.safeParse([valid]);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data[0]).toMatchObject({ isTerminal: false, visibleToApplicant: true });
    }
  });

  it("rejects an invalid key or color", () => {
    expect(statusDefsSchema.safeParse([{ ...valid, key: "Bad Key" }]).success).toBe(false);
    expect(statusDefsSchema.safeParse([{ ...valid, color: "red" }]).success).toBe(false);
  });

  it("rejects duplicate keys", () => {
    expect(statusDefsSchema.safeParse([valid, { ...valid, label: "Again" }]).success).toBe(false);
  });

  it("accepts an empty list", () => {
    expect(statusDefsSchema.safeParse([]).success).toBe(true);
  });
});
