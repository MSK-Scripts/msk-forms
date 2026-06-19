import { describe, expect, it } from "vitest";
import { buildAnswerSchema, formSpecSchema, type FormSpec } from "./form-spec.js";

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

describe("buildAnswerSchema", () => {
  it("enforces required fields and ignores layout fields", () => {
    const answerSchema = buildAnswerSchema(spec);
    expect(answerSchema.safeParse({ name: "Moritz", age: 30 }).success).toBe(true);
    expect(answerSchema.safeParse({ age: 30 }).success).toBe(false); // name missing
  });
});
