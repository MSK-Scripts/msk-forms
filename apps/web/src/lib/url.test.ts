import { describe, expect, it } from "vitest";

import { safeRelativePath } from "./url";

describe("safeRelativePath", () => {
  it("keeps a plain same-origin path", () => {
    expect(safeRelativePath("/dashboard")).toBe("/dashboard");
    expect(safeRelativePath("/f/my-form")).toBe("/f/my-form");
    expect(safeRelativePath("/s/abc?x=1#y")).toBe("/s/abc?x=1#y");
  });

  it("falls back for empty / missing input", () => {
    expect(safeRelativePath(null)).toBe("/");
    expect(safeRelativePath(undefined)).toBe("/");
    expect(safeRelativePath("")).toBe("/");
    expect(safeRelativePath(null, "/dashboard")).toBe("/dashboard");
  });

  it("rejects non-relative and protocol-relative values", () => {
    expect(safeRelativePath("dashboard")).toBe("/");
    expect(safeRelativePath("https://evil.com")).toBe("/");
    expect(safeRelativePath("//evil.com")).toBe("/");
  });

  it("rejects the backslash open-redirect bypass", () => {
    // `new URL("/\\evil.com", "https://x")` would resolve to https://evil.com/.
    expect(safeRelativePath("/\\evil.com")).toBe("/");
    expect(safeRelativePath("/path\\sub")).toBe("/");
    expect(safeRelativePath("/\\/evil.com")).toBe("/");
  });

  it("rejects control characters (newline, tab, NUL, DEL)", () => {
    expect(safeRelativePath("/\nevil")).toBe("/");
    expect(safeRelativePath("/\tevil")).toBe("/");
    expect(safeRelativePath("/\x00evil")).toBe("/");
    expect(safeRelativePath("/\x7fevil")).toBe("/");
  });

  it("confirms a sanitized path can't resolve off-origin", () => {
    const base = "https://forms.example.com";
    for (const raw of ["/\\evil.com", "//evil.com", "https://evil.com", "/\tx"]) {
      expect(new URL(safeRelativePath(raw), base).origin).toBe(base);
    }
  });
});
