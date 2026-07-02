import { describe, expect, it } from "vitest";

import { isTerminalStatus, statusDefsSchema } from "./status-defs.js";

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

describe("isTerminalStatus", () => {
  it("uses the built-in terminal flags when there's no custom def", () => {
    expect(isTerminalStatus("submitted", [])).toBe(false);
    expect(isTerminalStatus("in_review", [])).toBe(false);
    expect(isTerminalStatus("accepted", [])).toBe(true);
    expect(isTerminalStatus("rejected", [])).toBe(true);
    expect(isTerminalStatus("withdrawn", [])).toBe(true);
    expect(isTerminalStatus("unknown", [])).toBe(false);
  });

  it("lets a custom def flag its own status terminal", () => {
    expect(isTerminalStatus("shortlisted", [{ key: "shortlisted", isTerminal: true }])).toBe(true);
    expect(isTerminalStatus("shortlisted", [{ key: "shortlisted", isTerminal: false }])).toBe(false);
  });

  it("lets a custom def override a built-in terminal flag", () => {
    expect(isTerminalStatus("accepted", [{ key: "accepted", isTerminal: false }])).toBe(false);
  });
});
