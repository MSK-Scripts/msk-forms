import { describe, expect, it } from "vitest";
import {
  buildAnswerSchema,
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
});
