import { describe, expect, it } from "vitest";

import { describeError } from "./log.js";

describe("describeError", () => {
  it("keeps the Discord error code, drops the request body", () => {
    // Shaped like a real DiscordAPIError. `requestBody` is what made a single
    // failure cost ~1.8 KB.
    const err = Object.assign(new Error("Cannot send messages to this user"), {
      code: 50278,
      status: 403,
      method: "POST",
      requestBody: { json: { content: "…", tts: false, nonce: undefined } },
    });

    const line = describeError(err);

    expect(line).toContain("50278");
    expect(line).toContain("Cannot send messages to this user");
    expect(line).not.toContain("requestBody");
    expect(line).not.toContain("tts");
  });

  it("keeps a Prisma error code and collapses its multi-line message", () => {
    const err = Object.assign(
      new Error("\nInvalid `prisma.notification.findMany()` invocation:\n\n\n"),
      { code: "ECONNREFUSED", clientVersion: "7.9.1", meta: { modelName: "Notification" } },
    );

    const line = describeError(err);

    expect(line).toContain("ECONNREFUSED");
    expect(line).toContain("prisma.notification.findMany()");
    expect(line.split("\n")).toHaveLength(1);
  });

  it("keeps a plain error readable", () => {
    expect(describeError(new Error("socket hang up"))).toBe("socket hang up");
  });

  it("caps a long message so one failure cannot fill a log", () => {
    const line = describeError(new Error("x".repeat(5_000)));
    expect(line.length).toBeLessThan(250);
  });

  it("survives whatever else gets thrown", () => {
    expect(describeError("just a string")).toBe("just a string");
    expect(describeError(null)).toBe("null");
    expect(describeError(undefined)).toBe("undefined");
    expect(describeError(42)).toBe("42");
    expect(describeError({})).toBe("unknown error");
  });
});
