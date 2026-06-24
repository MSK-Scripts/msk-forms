import { describe, expect, it } from "vitest";

import { evaluateFormula, referencedFieldIds } from "./formula.js";
import type { FormField } from "./form-spec.js";

/** Build a field-by-id map from a partial field list. */
function fieldsById(...fields: (Partial<FormField> & Pick<FormField, "id" | "type">)[]) {
  const map = new Map<string, FormField>();
  for (const f of fields) {
    map.set(f.id, { width: "full", validation: { required: false }, conditional: [], ...f } as FormField);
  }
  return map;
}

const numFields = fieldsById(
  { id: "price", type: "number" },
  { id: "qty", type: "number" },
);

describe("referencedFieldIds", () => {
  it("extracts unique field ids from placeholders", () => {
    expect(referencedFieldIds("{a} + {b} * {a}")).toEqual(["a", "b"]);
  });
  it("returns empty for a constant formula", () => {
    expect(referencedFieldIds("2 + 2")).toEqual([]);
  });
});

describe("evaluateFormula", () => {
  it("returns null for an empty formula", () => {
    expect(evaluateFormula("", numFields, {})).toBeNull();
    expect(evaluateFormula(undefined, numFields, {})).toBeNull();
  });

  it("evaluates arithmetic with precedence and parentheses", () => {
    expect(evaluateFormula("2 + 3 * 4", numFields, {})).toBe(14);
    expect(evaluateFormula("(2 + 3) * 4", numFields, {})).toBe(20);
    expect(evaluateFormula("-5 + 2", numFields, {})).toBe(-3);
  });

  it("substitutes field references with their numeric values", () => {
    expect(evaluateFormula("{price} * {qty}", numFields, { price: 10, qty: 3 })).toBe(30);
    expect(evaluateFormula("{price} - {qty}", numFields, { price: 5, qty: 8 })).toBe(-3);
  });

  it("treats blank or unknown references as 0", () => {
    expect(evaluateFormula("{price} + {qty}", numFields, { price: 7 })).toBe(7);
    expect(evaluateFormula("{nope} + 1", numFields, {})).toBe(1);
  });

  it("uses option scores for choice references", () => {
    const map = fieldsById(
      {
        id: "plan",
        type: "single_choice",
        options: [
          { value: "basic", label: "Basic", score: 5 },
          { value: "pro", label: "Pro", score: 20 },
        ],
      },
      {
        id: "addons",
        type: "multi_choice",
        options: [
          { value: "a", label: "A", score: 2 },
          { value: "b", label: "B", score: 3 },
        ],
      },
    );
    expect(evaluateFormula("{plan} + {addons}", map, { plan: "pro", addons: ["a", "b"] })).toBe(25);
    expect(evaluateFormula("{plan}", map, { plan: "basic" })).toBe(5);
  });

  it("maps boolean fields to 1/0", () => {
    const map = fieldsById({ id: "agree", type: "consent" });
    expect(evaluateFormula("{agree} * 10", map, { agree: true })).toBe(10);
    expect(evaluateFormula("{agree} * 10", map, { agree: false })).toBe(0);
  });

  it("returns null on divide by zero", () => {
    expect(evaluateFormula("{price} / {qty}", numFields, { price: 5, qty: 0 })).toBeNull();
  });

  it("returns null on a malformed formula", () => {
    expect(evaluateFormula("2 +", numFields, {})).toBeNull();
    expect(evaluateFormula("2 ** 3", numFields, {})).toBeNull();
    expect(evaluateFormula("alert(1)", numFields, {})).toBeNull();
  });

  it("rounds to 6 decimal places", () => {
    expect(evaluateFormula("1 / 3", numFields, {})).toBe(0.333333);
  });
});
