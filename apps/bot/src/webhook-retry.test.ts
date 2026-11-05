import { describe, expect, it } from "vitest";

import { backoffMs, failedAttempt, MAX_ATTEMPTS } from "./webhook-retry.js";

const NOW = Date.UTC(2026, 10, 5, 12, 0, 0);

describe("failedAttempt", () => {
  it("counts the attempt and schedules a retry", () => {
    const next = failedAttempt(0, "HTTP 500", NOW);
    expect(next.status).toBe("pending");
    expect(next.attempts).toBe(1);
    expect(next.lastError).toBe("HTTP 500");
    expect(next.nextAttemptAt.getTime()).toBe(NOW + backoffMs(1));
    expect(next.nextAttemptAt.getTime()).toBeGreaterThan(NOW);
  });

  it("gives up after MAX_ATTEMPTS", () => {
    expect(failedAttempt(MAX_ATTEMPTS - 2, "x", NOW).status).toBe("pending");
    expect(failedAttempt(MAX_ATTEMPTS - 1, "x", NOW).status).toBe("failed");
  });

  it("ends a row that fails on every tick instead of retrying it forever", () => {
    let attempts = 0;
    let status = "pending";
    let ticks = 0;
    while (status === "pending" && ticks < 100) {
      const next = failedAttempt(attempts, "Cannot read properties of undefined", NOW);
      attempts = next.attempts;
      status = next.status;
      ticks++;
    }
    expect(status).toBe("failed");
    expect(ticks).toBe(MAX_ATTEMPTS);
  });

  it("keeps lastError short enough for the column", () => {
    expect(failedAttempt(0, "e".repeat(2000), NOW).lastError).toHaveLength(500);
    expect(failedAttempt(0, null, NOW).lastError).toBeNull();
  });
});
