import { describe, expect, it } from "vitest";

import {
  isExhausted,
  isTerminalDmCode,
  MAX_DELIVERY_ATTEMPTS,
  nextAttemptAt,
  retryDelayMs,
} from "./delivery-policy.js";

describe("terminal DM codes", () => {
  it("treats both 'cannot DM this user' codes as permanent", () => {
    expect(isTerminalDmCode(50007)).toBe(true);
    // The one that was missing and caused rows to be retried forever.
    expect(isTerminalDmCode(50278)).toBe(true);
  });

  it("accepts the string form discord.js sometimes hands back", () => {
    expect(isTerminalDmCode("50278")).toBe(true);
  });

  it("leaves genuinely transient failures retryable", () => {
    expect(isTerminalDmCode(500)).toBe(false);
    expect(isTerminalDmCode(undefined)).toBe(false);
    expect(isTerminalDmCode(null)).toBe(false);
  });
});

describe("backoff", () => {
  it("grows with each failure", () => {
    expect(retryDelayMs(0)).toBe(30_000);
    expect(retryDelayMs(1)).toBe(60_000);
    expect(retryDelayMs(2)).toBe(120_000);
  });

  it("is capped so a stuck row cannot drift years into the future", () => {
    expect(retryDelayMs(50)).toBe(30 * 60_000);
  });

  it("never returns a negative or NaN delay for junk input", () => {
    expect(retryDelayMs(-5)).toBe(30_000);
    expect(retryDelayMs(1.7)).toBe(60_000);
  });

  it("offsets from the given clock", () => {
    const now = new Date("2026-08-18T00:00:00.000Z");
    expect(nextAttemptAt(0, now).toISOString()).toBe("2026-08-18T00:00:30.000Z");
  });
});

describe("exhaustion", () => {
  it("retires a row only after the last attempt", () => {
    expect(isExhausted(MAX_DELIVERY_ATTEMPTS - 1)).toBe(false);
    expect(isExhausted(MAX_DELIVERY_ATTEMPTS)).toBe(true);
  });

  it("keeps the whole retry window under a few hours", () => {
    let total = 0;
    for (let i = 0; i < MAX_DELIVERY_ATTEMPTS; i++) total += retryDelayMs(i);
    expect(total).toBeLessThan(3 * 60 * 60_000);
  });
});
