import { describe, expect, it } from "vitest";

import { formDefinitionSchema } from "./form-definition.js";

describe("formDefinitionSchema", () => {
  const definition = {
    mskForms: { type: "form-definition", version: 1 },
    form: {
      title: "Staff application",
      slug: "staff-application",
      status: "live",
      visibility: "public",
      openAt: "2026-09-16T10:00:00.000Z",
      closeAt: null,
    },
    spec: { pages: [{ id: "p1", fields: [{ id: "name", type: "short_text" }] }] },
  };

  it("fills in the settings defaults when settings are missing", () => {
    const r = formDefinitionSchema.safeParse(definition);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.settings).toEqual({ automations: [], singleSubmission: true });
    }
  });

  it("fills in the settings defaults for an empty settings object", () => {
    const r = formDefinitionSchema.safeParse({ ...definition, settings: {} });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.settings).toEqual({ automations: [], singleSubmission: true });
    }
  });

  it("keeps explicit settings", () => {
    const r = formDefinitionSchema.safeParse({
      ...definition,
      settings: { singleSubmission: false, showCountdown: true },
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.settings).toEqual({
        automations: [],
        singleSubmission: false,
        showCountdown: true,
      });
    }
  });

  it("rejects JSON that is not a form definition", () => {
    expect(
      formDefinitionSchema.safeParse({ ...definition, mskForms: { type: "other", version: 1 } })
        .success,
    ).toBe(false);
  });
});
