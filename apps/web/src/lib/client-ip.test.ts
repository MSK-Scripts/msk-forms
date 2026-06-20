import { describe, expect, it } from "vitest";

import { clientIp } from "./client-ip";

describe("clientIp", () => {
  it("takes the last hop of X-Forwarded-For (the one our trusted proxy appended)", () => {
    const h = new Headers({ "x-forwarded-for": "203.0.113.5, 10.0.0.1, 198.51.100.7" });
    expect(clientIp(h)).toBe("198.51.100.7");
  });

  it("ignores a client-spoofed left entry", () => {
    // Attacker sends "X-Forwarded-For: 1.2.3.4"; Apache appends the real peer.
    const h = new Headers({ "x-forwarded-for": "1.2.3.4, 203.0.113.9" });
    expect(clientIp(h)).toBe("203.0.113.9");
  });

  it("handles a single entry", () => {
    expect(clientIp(new Headers({ "x-forwarded-for": "203.0.113.5" }))).toBe("203.0.113.5");
  });

  it("accepts IPv6 addresses", () => {
    const h = new Headers({ "x-forwarded-for": "2001:db8::1" });
    expect(clientIp(h)).toBe("2001:db8::1");
  });

  it("rejects a malformed last entry and falls through", () => {
    const h = new Headers({ "x-forwarded-for": "203.0.113.5, not-an-ip" });
    expect(clientIp(h)).toBe("unknown");
  });

  it("falls back to x-real-ip", () => {
    expect(clientIp(new Headers({ "x-real-ip": "198.51.100.7" }))).toBe("198.51.100.7");
  });

  it("returns 'unknown' when no proxy headers are present", () => {
    expect(clientIp(new Headers())).toBe("unknown");
  });
});
