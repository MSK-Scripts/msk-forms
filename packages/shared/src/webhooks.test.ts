import { describe, expect, it } from "vitest";

import {
  buildDiscordWebhookBody,
  buildSubmissionWebhookPayload,
  webhookInputSchema,
  webhookSubscribeSchema,
} from "./webhooks.js";

/** A minimal two-field spec (one answer field, one layout field that is skipped). */
const schema = {
  version: 1,
  pages: [
    {
      id: "p1",
      fields: [
        { id: "name", type: "short_text", label: "Your name", width: "full", validation: { required: true }, conditional: [] },
        { id: "role", type: "single_choice", label: "Role", width: "full", validation: { required: false }, conditional: [], options: [{ value: "dev", label: "Developer" }] },
        { id: "h1", type: "heading", width: "full", validation: { required: false }, conditional: [] },
      ],
    },
  ],
};

const form = { id: "f1", slug: "apply", title: "Application", schema };
const submission = {
  id: "s1",
  status: "submitted",
  score: null,
  submittedAt: "2026-06-24T10:00:00.000Z",
  answers: { name: "Ada", role: "dev" },
};

describe("webhookSubscribeSchema", () => {
  it("accepts a valid subscribe body and defaults the source", () => {
    const parsed = webhookSubscribeSchema.parse({
      targetUrl: "https://hooks.zapier.com/abc",
      event: "submission.created",
    });
    expect(parsed.source).toBe("integration");
  });

  it("rejects an unknown event", () => {
    expect(() =>
      webhookSubscribeSchema.parse({ targetUrl: "https://x.test", event: "nope" }),
    ).toThrow();
  });

  it("rejects a non-URL target", () => {
    expect(() =>
      webhookSubscribeSchema.parse({ targetUrl: "not-a-url", event: "submission.created" }),
    ).toThrow();
  });
});

describe("webhookInputSchema format", () => {
  it("defaults to json and accepts any URL", () => {
    const parsed = webhookInputSchema.parse({
      url: "https://example.com/hooks",
      events: ["submission.created"],
    });
    expect(parsed.format).toBe("json");
  });

  it("requires a real Discord webhook URL for the discord format", () => {
    expect(
      webhookInputSchema.safeParse({
        url: "https://example.com/hooks",
        events: ["submission.created"],
        format: "discord",
      }).success,
    ).toBe(false);
    expect(
      webhookInputSchema.safeParse({
        url: "https://discord.com/api/webhooks/123456789/AbC-tok_en",
        events: ["submission.created"],
        format: "discord",
      }).success,
    ).toBe(true);
  });
});

describe("buildDiscordWebhookBody", () => {
  const payload = buildSubmissionWebhookPayload({
    event: "submission.created",
    at: "2026-06-24T10:00:00.000Z",
    guildId: "g1",
    form,
    submission,
    applicant: { discordId: "123", name: "Ada" },
  });

  it("renders one embed with applicant, status and answer fields", () => {
    const body = buildDiscordWebhookBody(payload);
    expect(body.embeds).toHaveLength(1);
    const embed = body.embeds[0]!;
    expect(embed.title).toContain("New submission");
    expect(embed.title).toContain("Application");
    const names = embed.fields.map((f) => f.name);
    expect(names).toContain("Applicant");
    expect(names).toContain("Status");
    expect(names).toContain("Your name");
    expect(embed.fields.find((f) => f.name === "Your name")?.value).toBe("Ada");
  });

  it("shows the status transition for a status_changed event", () => {
    const changed = buildSubmissionWebhookPayload({
      event: "submission.status_changed",
      at: "2026-06-24T11:00:00.000Z",
      guildId: "g1",
      form,
      submission: { ...submission, status: "accepted" },
      transition: { fromStatus: "submitted", toStatus: "accepted" },
    });
    const embed = buildDiscordWebhookBody(changed).embeds[0]!;
    expect(embed.title).toContain("Submission updated");
    expect(embed.fields.find((f) => f.name === "Status")?.value).toBe("submitted → accepted");
  });
});

describe("buildSubmissionWebhookPayload", () => {
  it("enriches a created event with formatted answers, skipping layout fields", () => {
    const payload = buildSubmissionWebhookPayload({
      event: "submission.created",
      at: "2026-06-24T10:00:00.000Z",
      guildId: "g1",
      form,
      submission,
      applicant: { discordId: "123", name: "Ada" },
    });

    expect(payload.event).toBe("submission.created");
    expect(payload.formSlug).toBe("apply");
    expect(payload.answers).toHaveLength(2); // heading skipped
    expect(payload.answers[0]).toEqual({
      fieldId: "name",
      label: "Your name",
      type: "short_text",
      value: "Ada",
    });
    // Option value resolved to its label.
    expect(payload.answers[1]?.value).toBe("Developer");
    expect(payload.applicant).toEqual({ discordId: "123", name: "Ada", anonymous: false });
    expect(payload).not.toHaveProperty("toStatus");
  });

  it("marks an applicant with no identity as anonymous", () => {
    const payload = buildSubmissionWebhookPayload({
      event: "submission.created",
      at: "2026-06-24T10:00:00.000Z",
      guildId: "g1",
      form,
      submission,
    });
    expect(payload.applicant).toEqual({ discordId: null, name: null, anonymous: true });
  });

  it("includes the status transition for a status_changed event", () => {
    const payload = buildSubmissionWebhookPayload({
      event: "submission.status_changed",
      at: "2026-06-24T11:00:00.000Z",
      guildId: "g1",
      form,
      submission: { ...submission, status: "accepted" },
      transition: { fromStatus: "submitted", toStatus: "accepted" },
    });
    expect(payload.fromStatus).toBe("submitted");
    expect(payload.toStatus).toBe("accepted");
  });

  it("yields an empty answers array for an unparsable spec", () => {
    const payload = buildSubmissionWebhookPayload({
      event: "submission.created",
      at: "2026-06-24T10:00:00.000Z",
      guildId: "g1",
      form: { ...form, schema: { not: "a spec" } },
      submission,
    });
    expect(payload.answers).toEqual([]);
  });
});
