import { describe, expect, it } from "vitest";

import { guildStrings } from "./guild-i18n.js";
import { buildLogEmbed, formatActor } from "./log-embed.js";

const en = guildStrings("en");

describe("formatActor", () => {
  it("combines name and mention", () => {
    expect(formatActor("alice", "123456789012345678")).toBe("alice (<@123456789012345678>)");
  });

  it("falls back to whichever part is known", () => {
    expect(formatActor("Bot", undefined)).toBe("Bot");
    expect(formatActor(undefined, "123456789012345678")).toBe("<@123456789012345678>");
    expect(formatActor(undefined, undefined)).toBeNull();
  });

  it("never turns a non-snowflake id into markup", () => {
    expect(formatActor("eve", "123> @everyone <@1")).toBe("eve");
  });
});

describe("buildLogEmbed", () => {
  it("renders who, what and when", () => {
    const embed = buildLogEmbed(
      {
        action: "member_role_changed",
        actorName: "alice",
        actorId: "123456789012345678",
        detail: "bob: viewer → admin",
        at: "2026-09-16T10:00:00.000Z",
      },
      en,
    );
    expect(embed?.title).toBe("👤 Member role changed");
    expect(embed?.timestamp).toBe("2026-09-16T10:00:00.000Z");
    expect(embed?.fields).toEqual([
      { name: "By", value: "alice (<@123456789012345678>)", inline: true },
      { name: "Details", value: "bob: viewer → admin" },
    ]);
  });

  it("shows the transition for status changes and links the dashboard", () => {
    const embed = buildLogEmbed(
      {
        action: "status_changed",
        actorName: "alice",
        fromStatus: "submitted",
        toStatus: "accepted",
        toStatusLabel: "Accepted",
      },
      en,
      { dashboardUrl: "https://forms.example/dashboard/g/submissions/s" },
    );
    expect(embed?.url).toBe("https://forms.example/dashboard/g/submissions/s");
    expect(embed?.fields).toContainEqual({
      name: "Status",
      value: "submitted → Accepted",
      inline: true,
    });
  });

  it("localizes the title", () => {
    expect(buildLogEmbed({ action: "api_key_revoked" }, guildStrings("de"))?.title).toBe(
      "🗝️ API-Schlüssel widerrufen",
    );
  });

  it("clips oversized details to Discord's field limit", () => {
    const embed = buildLogEmbed({ action: "message_sent", detail: "x".repeat(5000) }, en);
    expect(embed?.fields?.[0]?.value.length).toBe(1024);
  });

  it("returns null for unknown actions", () => {
    expect(buildLogEmbed({ action: "nope" as never }, en)).toBeNull();
    expect(buildLogEmbed({}, en)).toBeNull();
  });
});
