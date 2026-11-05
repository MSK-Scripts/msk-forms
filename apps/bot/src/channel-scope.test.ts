import { describe, expect, it } from "vitest";

import { isChannelInGuild } from "./channel-scope.js";

const GUILD = "111111111111111111";
const OTHER = "222222222222222222";

describe("isChannelInGuild", () => {
  it("accepts a channel of the delivery's own guild", () => {
    expect(isChannelInGuild({ id: "1", guildId: GUILD }, GUILD)).toBe(true);
  });

  it("rejects a channel on another server", () => {
    expect(isChannelInGuild({ id: "1", guildId: OTHER }, GUILD)).toBe(false);
  });

  it("rejects channels without a guild, such as DMs", () => {
    expect(isChannelInGuild({ id: "1" }, GUILD)).toBe(false);
    expect(isChannelInGuild({ id: "1", guildId: null }, GUILD)).toBe(false);
  });

  it("rejects everything when the guild's Discord id is unknown", () => {
    expect(isChannelInGuild({ id: "1", guildId: GUILD }, null)).toBe(false);
    expect(isChannelInGuild({ id: "1", guildId: GUILD }, undefined)).toBe(false);
    expect(isChannelInGuild({ id: "1", guildId: "" }, "")).toBe(false);
  });
});
