import { describe, expect, it } from "vitest";

import { botConfigBody, botConfigValuesOf, type BotConfigValues } from "./bot-config-values";

const empty: BotConfigValues = { channel: "", logChannel: "", locale: "", role: "", postName: "" };

describe("bot config form values", () => {
  it("shows an unset locale as not set, not as English", () => {
    expect(botConfigValuesOf({}).locale).toBe("");
    expect(botConfigValuesOf({ locale: "de" }).locale).toBe("de");
  });

  it("leaves the locale out of the body when it is not set", () => {
    expect(botConfigBody(empty)).not.toHaveProperty("locale");
  });

  it("saves a chosen locale", () => {
    expect(botConfigBody({ ...empty, locale: "pl" }).locale).toBe("pl");
  });

  it("round-trips a stored config without adding a locale", () => {
    const stored = {
      reviewChannelId: "123456789012345678",
      acceptedRoleIds: ["223456789012345678"],
    };
    expect(botConfigBody(botConfigValuesOf(stored))).toEqual(stored);
  });
});
