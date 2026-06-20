import { describe, expect, it } from "vitest";

import { clientIp } from "./client-ip";

describe("clientIp", () => {
  it("takes the first hop of X-Forwarded-For", () => {
    const h = new Headers({ "x-forwarded-for": "203.0.113.5, 10.0.0.1, 127.0.0.1" });
    expect(clientIp(h)).toBe("203.0.113.5");
  });

  it("falls back to x-real-ip", () => {
    expect(clientIp(new Headers({ "x-real-ip": "198.51.100.7" }))).toBe("198.51.100.7");
  });

  it("returns 'unknown' when no proxy headers are present", () => {
    expect(clientIp(new Headers())).toBe("unknown");
  });
});
