import { describe, expect, it } from "vitest";

import { categoryPayload, categoryRowsFrom } from "./category-rows";

describe("category rows", () => {
  it("keeps a category without colour without colour through a save", () => {
    const stored = [
      { id: "8f0c1a52-3c3e-4b8e-9d55-0d3c2a1b4e01", name: "Police", color: null, order: 0 },
      { id: "8f0c1a52-3c3e-4b8e-9d55-0d3c2a1b4e02", name: "Medics", color: "#d14343", order: 1 },
    ];
    expect(categoryPayload(categoryRowsFrom(stored))).toEqual(stored);
  });

  it("saves a cleared colour field as no colour", () => {
    const [row] = categoryRowsFrom([{ name: "Fire", color: "#123456", order: 0 }]);
    expect(categoryPayload([{ ...row!, color: "  " }])[0]?.color).toBeNull();
  });

  it("trims names and numbers the order by position", () => {
    const payload = categoryPayload([
      { uid: "a", name: " B ", color: "" },
      { uid: "b", name: "A", color: "#000000" },
    ]);
    expect(payload.map((c) => [c.name, c.order])).toEqual([
      ["B", 0],
      ["A", 1],
    ]);
  });
});
