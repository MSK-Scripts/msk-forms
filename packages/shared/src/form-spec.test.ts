import { describe, expect, it } from "vitest";
import {
  buildAnswerSchema,
  formatAnswerValue,
  formSpecSchema,
  isLayoutField,
  type FormField,
  type FormSpec,
} from "./form-spec.js";

/** Build a one-field spec to exercise `buildFieldSchema` via the public API. */
function specWith(field: Partial<FormField> & Pick<FormField, "id" | "type">): FormSpec {
  return {
    version: 1,
    pages: [
      {
        id: "p1",
        fields: [{ width: "full", validation: { required: false }, conditional: [], ...field }],
      },
    ],
  };
}

const spec: FormSpec = {
  version: 1,
  pages: [
    {
      id: "p1",
      title: "Page 1",
      fields: [
        { id: "name", type: "short_text", width: "full", validation: { required: true }, conditional: [] },
        { id: "age", type: "number", width: "full", validation: { required: false }, conditional: [] },
        { id: "heading1", type: "heading", width: "full", validation: { required: false }, conditional: [] },
      ],
    },
  ],
};

describe("formSpecSchema", () => {
  it("parses a valid form spec", () => {
    expect(() => formSpecSchema.parse(spec)).not.toThrow();
  });

  it("rejects a spec without pages", () => {
    expect(() => formSpecSchema.parse({ version: 1, pages: [] })).toThrow();
  });
});

describe("isLayoutField", () => {
  it("classifies layout vs answer fields", () => {
    expect(isLayoutField("heading")).toBe(true);
    expect(isLayoutField("divider")).toBe(true);
    expect(isLayoutField("short_text")).toBe(false);
    expect(isLayoutField("file_upload")).toBe(false);
  });
});

describe("buildAnswerSchema", () => {
  it("enforces required fields and ignores layout fields", () => {
    const answerSchema = buildAnswerSchema(spec);
    expect(answerSchema.safeParse({ name: "Moritz", age: 30 }).success).toBe(true);
    expect(answerSchema.safeParse({ age: 30 }).success).toBe(false); // name missing
  });

  it("rejects an empty string for a required text field", () => {
    const s = buildAnswerSchema(specWith({ id: "x", type: "short_text", validation: { required: true } }));
    expect(s.safeParse({ x: "" }).success).toBe(false);
    expect(s.safeParse({ x: "ok" }).success).toBe(true);
  });

  it("enforces number min/max", () => {
    const s = buildAnswerSchema(
      specWith({ id: "n", type: "number", validation: { required: true, min: 18, max: 99 } }),
    );
    expect(s.safeParse({ n: 17 }).success).toBe(false);
    expect(s.safeParse({ n: 100 }).success).toBe(false);
    expect(s.safeParse({ n: 30 }).success).toBe(true);
  });

  it("enforces string length and pattern", () => {
    const s = buildAnswerSchema(
      specWith({
        id: "t",
        type: "short_text",
        validation: { required: true, minLength: 2, maxLength: 5, pattern: "^[a-z]+$" },
      }),
    );
    expect(s.safeParse({ t: "a" }).success).toBe(false); // too short
    expect(s.safeParse({ t: "abcdef" }).success).toBe(false); // too long
    expect(s.safeParse({ t: "AB" }).success).toBe(false); // pattern
    expect(s.safeParse({ t: "abc" }).success).toBe(true);
  });

  it("validates the email format for email fields", () => {
    const s = buildAnswerSchema(specWith({ id: "e", type: "email", validation: { required: true } }));
    expect(s.safeParse({ e: "not-an-email" }).success).toBe(false);
    expect(s.safeParse({ e: "a@b.com" }).success).toBe(true);
  });

  it("restricts single-choice answers to the option set", () => {
    const s = buildAnswerSchema(
      specWith({
        id: "c",
        type: "single_choice",
        validation: { required: true },
        options: [
          { value: "a", label: "A" },
          { value: "b", label: "B" },
        ],
      }),
    );
    expect(s.safeParse({ c: "z" }).success).toBe(false);
    expect(s.safeParse({ c: "a" }).success).toBe(true);
  });

  it("restricts multi-choice answers to the option set and count", () => {
    const s = buildAnswerSchema(
      specWith({
        id: "m",
        type: "multi_choice",
        validation: { required: true, max: 2 },
        options: [
          { value: "a", label: "A" },
          { value: "b", label: "B" },
          { value: "c", label: "C" },
        ],
      }),
    );
    expect(s.safeParse({ m: ["a", "z"] }).success).toBe(false); // unknown option
    expect(s.safeParse({ m: ["a", "b", "c"] }).success).toBe(false); // over max
    expect(s.safeParse({ m: ["a", "b"] }).success).toBe(true);
  });

  it("ignores an invalid stored regex pattern instead of rejecting everything", () => {
    const s = buildAnswerSchema(
      specWith({ id: "t", type: "short_text", validation: { required: true, pattern: "(" } }),
    );
    expect(s.safeParse({ t: "anything" }).success).toBe(true);
  });

  it("enforces the fixed NPS 0–10 scale (incl. 0)", () => {
    const s = buildAnswerSchema(specWith({ id: "n", type: "nps", validation: { required: true } }));
    expect(s.safeParse({ n: 0 }).success).toBe(true);
    expect(s.safeParse({ n: 10 }).success).toBe(true);
    expect(s.safeParse({ n: 11 }).success).toBe(false);
    expect(s.safeParse({ n: -1 }).success).toBe(false);
  });

  it("defaults star rating to 1–5 and respects a custom max", () => {
    const def = buildAnswerSchema(specWith({ id: "r", type: "rating_stars", validation: { required: true } }));
    expect(def.safeParse({ r: 5 }).success).toBe(true);
    expect(def.safeParse({ r: 6 }).success).toBe(false);
    expect(def.safeParse({ r: 0 }).success).toBe(false);

    const ten = buildAnswerSchema(
      specWith({ id: "r", type: "rating_stars", validation: { required: true, max: 10 } }),
    );
    expect(ten.safeParse({ r: 10 }).success).toBe(true);
  });

  it("enforces the emoji scale 1–5", () => {
    const s = buildAnswerSchema(specWith({ id: "e", type: "emoji_scale", validation: { required: true } }));
    expect(s.safeParse({ e: 1 }).success).toBe(true);
    expect(s.safeParse({ e: 5 }).success).toBe(true);
    expect(s.safeParse({ e: 6 }).success).toBe(false);
  });

  it("enforces slider bounds (default 0–100)", () => {
    const s = buildAnswerSchema(specWith({ id: "s", type: "slider", validation: { required: true } }));
    expect(s.safeParse({ s: 0 }).success).toBe(true);
    expect(s.safeParse({ s: 100 }).success).toBe(true);
    expect(s.safeParse({ s: 101 }).success).toBe(false);
  });

  const matrixField = {
    id: "m",
    type: "matrix" as const,
    options: [
      { value: "y", label: "Yes" },
      { value: "n", label: "No" },
    ],
    rows: [
      { id: "r1", label: "Q1" },
      { id: "r2", label: "Q2" },
    ],
  };

  it("validates a required matrix against its rows and columns", () => {
    const s = buildAnswerSchema(specWith({ ...matrixField, validation: { required: true } }));
    expect(s.safeParse({ m: { r1: "y", r2: "n" } }).success).toBe(true);
    expect(s.safeParse({ m: { r1: "y" } }).success).toBe(false); // r2 missing
    expect(s.safeParse({ m: { r1: "x", r2: "n" } }).success).toBe(false); // bad column
  });

  it("allows a partial/empty matrix when optional", () => {
    const s = buildAnswerSchema(specWith({ ...matrixField, validation: { required: false } }));
    expect(s.safeParse({}).success).toBe(true);
    expect(s.safeParse({ m: { r1: "y" } }).success).toBe(true);
  });

  it("treats a signature as a file-reference answer", () => {
    const s = buildAnswerSchema(specWith({ id: "sig", type: "signature", validation: { required: true } }));
    const ok = { sig: { key: "uploads/f/abc", name: "signature.png", size: 120, mime: "image/png" } };
    expect(s.safeParse(ok).success).toBe(true);
    expect(s.safeParse({ sig: "not-a-file" }).success).toBe(false);
  });
});

describe("formatAnswerValue (rating family)", () => {
  const L = { empty: "—", yes: "Yes", no: "No" };
  it("renders nps, stars and emoji with their scale", () => {
    const nps: FormField = { id: "n", type: "nps", width: "full", validation: { required: false }, conditional: [] };
    const stars: FormField = { id: "r", type: "rating_stars", width: "full", validation: { required: false }, conditional: [] };
    const emoji: FormField = { id: "e", type: "emoji_scale", width: "full", validation: { required: false }, conditional: [] };
    expect(formatAnswerValue(nps, 8, L)).toBe("8 / 10");
    expect(formatAnswerValue(stars, 4, L)).toBe("★ 4");
    expect(formatAnswerValue(emoji, 5, L)).toContain("5/5");
  });

  it("renders a matrix answer as row: column pairs", () => {
    const matrix: FormField = {
      id: "m",
      type: "matrix",
      width: "full",
      validation: { required: false },
      conditional: [],
      options: [
        { value: "y", label: "Yes" },
        { value: "n", label: "No" },
      ],
      rows: [
        { id: "r1", label: "Q1" },
        { id: "r2", label: "Q2" },
      ],
    };
    expect(formatAnswerValue(matrix, { r1: "y", r2: "n" }, L)).toBe("Q1: Yes; Q2: No");
    expect(formatAnswerValue(matrix, {}, L)).toBe("—");
  });
});
