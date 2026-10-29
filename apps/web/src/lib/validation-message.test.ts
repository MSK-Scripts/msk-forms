import { VALIDATION_MESSAGES, type ValidationMessageKey } from "@msk-forms/shared";
import { describe, expect, it } from "vitest";
import { z } from "zod";

import { dictionaries } from "@/i18n/dictionaries";

import { localizeIssue } from "./validation-message";

const firstIssue = (schema: z.ZodType, value: unknown) => {
  const result = schema.safeParse(value);
  if (result.success) throw new Error("expected a validation error");
  return result.error.issues[0]!;
};

describe("localizeIssue", () => {
  const hexIssue = firstIssue(z.string().regex(/^#/, VALIDATION_MESSAGES.hexColor), "red");

  it("translates our own schema messages from the dictionary", () => {
    const de = localizeIssue(hexIssue, "de", dictionaries.de.validation);
    expect(de).toBe(dictionaries.de.validation.hexColor);
    expect(de).not.toBe(VALIDATION_MESSAGES.hexColor);
  });

  it("keeps English as the API sends it", () => {
    expect(localizeIssue(hexIssue, "en", dictionaries.en.validation)).toBe(
      VALIDATION_MESSAGES.hexColor,
    );
  });

  it("uses zod's own locale for its built-in messages", () => {
    const issue = firstIssue(z.string().max(3), "toolong");
    const de = localizeIssue(issue, "de", dictionaries.de.validation);
    expect(de).not.toBe(issue.message);
    expect(de).toMatch(/Zu groß/);
  });

  it("falls back to the generic text for a wrong type", () => {
    const issue = firstIssue(z.object({ n: z.number() }), { n: "x" });
    expect(localizeIssue(issue, "pl", dictionaries.pl.validation)).toBe(
      dictionaries.pl.validation.invalidValue,
    );
  });

  it("has a translation for every message key in every language", () => {
    for (const dict of Object.values(dictionaries)) {
      for (const key of Object.keys(VALIDATION_MESSAGES) as ValidationMessageKey[]) {
        expect(dict.validation[key]).toBeTruthy();
      }
    }
  });
});
