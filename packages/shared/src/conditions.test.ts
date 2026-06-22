import { describe, expect, it } from "vitest";

import {
  computePagePath,
  evaluateCondition,
  isFieldRequired,
  isFieldVisible,
} from "./conditions.js";
import type { ConditionRule, FormField, FormPage } from "./form-spec.js";

function field(partial: Partial<FormField> & Pick<FormField, "id" | "type">): FormField {
  return { width: "full", validation: { required: false }, conditional: [], ...partial };
}

describe("evaluateCondition", () => {
  const a = { country: "de", age: 18, tags: ["x", "y"] };
  it("handles each operator", () => {
    expect(evaluateCondition({ field: "country", op: "equals", value: "de" }, a)).toBe(true);
    expect(evaluateCondition({ field: "country", op: "not_equals", value: "us" }, a)).toBe(true);
    expect(evaluateCondition({ field: "tags", op: "contains", value: "x" }, a)).toBe(true);
    expect(evaluateCondition({ field: "age", op: "greater_than", value: 17 }, a)).toBe(true);
    expect(evaluateCondition({ field: "age", op: "less_than", value: 17 }, a)).toBe(false);
    expect(evaluateCondition({ field: "missing", op: "is_empty" }, a)).toBe(true);
    expect(evaluateCondition({ field: "country", op: "is_not_empty" }, a)).toBe(true);
    expect(evaluateCondition({ field: "country", op: "in_list", value: ["de", "at"] }, a)).toBe(true);
  });
});

describe("isFieldVisible", () => {
  it("is visible by default", () => {
    expect(isFieldVisible(field({ id: "f", type: "short_text" }), {})).toBe(true);
  });

  it("show rule: visible only when the condition matches", () => {
    const rules: ConditionRule[] = [
      { action: "show", when: { field: "q", op: "equals", value: "yes" } },
    ];
    const f = field({ id: "f", type: "short_text", conditional: rules });
    expect(isFieldVisible(f, { q: "yes" })).toBe(true);
    expect(isFieldVisible(f, { q: "no" })).toBe(false);
  });

  it("hide rule: hidden when the condition matches", () => {
    const rules: ConditionRule[] = [
      { action: "hide", when: { field: "q", op: "equals", value: "yes" } },
    ];
    const f = field({ id: "f", type: "short_text", conditional: rules });
    expect(isFieldVisible(f, { q: "yes" })).toBe(false);
    expect(isFieldVisible(f, { q: "no" })).toBe(true);
  });
});

describe("isFieldRequired", () => {
  it("respects the base required flag", () => {
    expect(isFieldRequired(field({ id: "f", type: "short_text", validation: { required: true } }), {})).toBe(true);
  });

  it("require rule makes an optional field required when matched", () => {
    const f = field({
      id: "f",
      type: "short_text",
      conditional: [{ action: "require", when: { field: "q", op: "equals", value: "other" } }],
    });
    expect(isFieldRequired(f, { q: "other" })).toBe(true);
    expect(isFieldRequired(f, { q: "a" })).toBe(false);
  });
});

describe("computePagePath (skip_to)", () => {
  const page = (id: string, fields: FormField[] = []): FormPage => ({ id, fields });
  // Page 1 jumps to page 3 when answer = "skip".
  const pages: FormPage[] = [
    page("p1", [
      field({
        id: "q",
        type: "single_choice",
        conditional: [{ action: "skip_to", target: "p3", when: { field: "q", op: "equals", value: "skip" } }],
      }),
    ]),
    page("p2"),
    page("p3"),
  ];

  it("walks pages sequentially when no skip matches", () => {
    expect(computePagePath(pages, { q: "no" })).toEqual([0, 1, 2]);
  });

  it("follows a skip_to jump, dropping skipped pages", () => {
    expect(computePagePath(pages, { q: "skip" })).toEqual([0, 2]);
  });

  it("guards against cycles", () => {
    const loop: FormPage[] = [
      page("a", [field({ id: "x", type: "short_text", conditional: [{ action: "skip_to", target: "a", when: { field: "x", op: "is_not_empty" } }] })]),
    ];
    expect(computePagePath(loop, { x: "v" })).toEqual([0]);
  });
});
