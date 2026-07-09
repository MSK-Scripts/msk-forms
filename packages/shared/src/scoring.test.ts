import { describe, expect, it } from "vitest";

import type { FormSpec } from "./form-spec.js";
import { scoreSubmission } from "./scoring.js";

const spec = (fields: FormSpec["pages"][number]["fields"]): FormSpec => ({
  version: 1,
  pages: [{ id: "p1", fields }],
});

describe("scoreSubmission", () => {
  it("returns null when no option carries a score", () => {
    const s = spec([
      { id: "q", type: "single_choice", width: "full", validation: { required: false }, conditional: [], options: [{ value: "a", label: "A" }, { value: "b", label: "B" }] },
    ]);
    expect(scoreSubmission(s, { q: "a" })).toBeNull();
  });

  it("sums the selected single-choice option's score", () => {
    const s = spec([
      { id: "q", type: "single_choice", width: "full", validation: { required: false }, conditional: [], options: [{ value: "a", label: "A", score: 10 }, { value: "b", label: "B", score: 0 }] },
    ]);
    expect(scoreSubmission(s, { q: "a" })).toBe(10);
    expect(scoreSubmission(s, { q: "b" })).toBe(0);
    expect(scoreSubmission(s, {})).toBe(0);
  });

  it("scores a yes_no field from its synthetic yes/no options", () => {
    const s = spec([
      { id: "q", type: "yes_no", width: "full", validation: { required: false }, conditional: [], options: [{ value: "yes", label: "Yes", score: 10 }, { value: "no", label: "No", score: 0 }] },
    ]);
    expect(scoreSubmission(s, { q: true })).toBe(10);
    expect(scoreSubmission(s, { q: false })).toBe(0);
    expect(scoreSubmission(s, {})).toBe(0); // unanswered
  });

  it("sums every selected option for multi-choice and across fields", () => {
    const s = spec([
      { id: "q1", type: "multi_choice", width: "full", validation: { required: false }, conditional: [], options: [{ value: "x", label: "X", score: 3 }, { value: "y", label: "Y", score: 5 }, { value: "z", label: "Z", score: 0 }] },
      { id: "q2", type: "single_choice", width: "full", validation: { required: false }, conditional: [], options: [{ value: "ok", label: "OK", score: 2 }] },
    ]);
    expect(scoreSubmission(s, { q1: ["x", "y"], q2: "ok" })).toBe(10);
    expect(scoreSubmission(s, { q1: ["z"] })).toBe(0);
  });
});
