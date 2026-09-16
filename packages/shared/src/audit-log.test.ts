import { describe, expect, it } from "vitest";

import {
  auditActionFromEvent,
  auditEvent,
  auditWebhookInputSchema,
  LOG_ACTION_GROUPS,
  maskDiscordWebhookUrl,
} from "./audit-log";
import { LOG_ACTIONS } from "./notifications";

const HOOK = "https://discord.com/api/webhooks/123456789012345678/abcDEF_-123";

describe("LOG_ACTION_GROUPS", () => {
  it("places every log action in exactly one group", () => {
    const grouped = Object.values(LOG_ACTION_GROUPS).flat();
    expect([...grouped].sort()).toEqual([...LOG_ACTIONS].sort());
    expect(new Set(grouped).size).toBe(grouped.length);
  });
});

describe("audit events", () => {
  it("round-trips an action through the event name", () => {
    expect(auditEvent("status_changed")).toBe("log.status_changed");
    expect(auditActionFromEvent("log.status_changed")).toBe("status_changed");
  });

  it("rejects generic webhook events and unknown actions", () => {
    expect(auditActionFromEvent("submission.created")).toBeNull();
    expect(auditActionFromEvent("log.not_a_thing")).toBeNull();
  });
});

describe("auditWebhookInputSchema", () => {
  it("accepts a Discord webhook with selected actions and dedupes them", () => {
    const parsed = auditWebhookInputSchema.parse({
      url: HOOK,
      actions: ["form_created", "form_created", "member_removed"],
    });
    expect(parsed.actions).toEqual(["form_created", "member_removed"]);
    expect(parsed.formId).toBeUndefined();
  });

  it("rejects a non-Discord URL", () => {
    expect(
      auditWebhookInputSchema.safeParse({
        url: "https://example.com/hook",
        actions: ["form_created"],
      }).success,
    ).toBe(false);
  });

  it("requires at least one action", () => {
    expect(auditWebhookInputSchema.safeParse({ url: HOOK, actions: [] }).success).toBe(false);
  });

  it("rejects unknown actions", () => {
    expect(auditWebhookInputSchema.safeParse({ url: HOOK, actions: ["nope"] }).success).toBe(false);
  });
});

describe("maskDiscordWebhookUrl", () => {
  it("keeps the webhook id but hides the token", () => {
    expect(maskDiscordWebhookUrl(HOOK)).toBe(
      "https://discord.com/api/webhooks/123456789012345678/••••••••",
    );
    expect(maskDiscordWebhookUrl(HOOK)).not.toContain("abcDEF");
  });

  it("hides anything it does not recognise", () => {
    expect(maskDiscordWebhookUrl("https://example.com/secret")).toBe("••••••••");
  });
});
