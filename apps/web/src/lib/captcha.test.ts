import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { captchaEnabled, captchaSiteKey, verifyCaptcha } from "./captcha";

const ENV = { site: process.env.CAPTCHA_SITE_KEY, secret: process.env.CAPTCHA_SECRET_KEY };

afterEach(() => {
  process.env.CAPTCHA_SITE_KEY = ENV.site;
  process.env.CAPTCHA_SECRET_KEY = ENV.secret;
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

beforeEach(() => {
  delete process.env.CAPTCHA_SITE_KEY;
  delete process.env.CAPTCHA_SECRET_KEY;
});

describe("captchaEnabled / captchaSiteKey", () => {
  it("is off unless BOTH keys are set", () => {
    expect(captchaEnabled()).toBe(false);
    process.env.CAPTCHA_SITE_KEY = "site";
    expect(captchaEnabled()).toBe(false);
    expect(captchaSiteKey()).toBe("site");
    process.env.CAPTCHA_SECRET_KEY = "secret";
    expect(captchaEnabled()).toBe(true);
  });
});

describe("verifyCaptcha", () => {
  it("passes through when captcha is not configured (nothing to enforce)", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    expect(await verifyCaptcha(undefined)).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("fails closed on a missing token when enabled", async () => {
    process.env.CAPTCHA_SECRET_KEY = "secret";
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    expect(await verifyCaptcha(undefined)).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns true only when Cloudflare reports success", async () => {
    process.env.CAPTCHA_SECRET_KEY = "secret";
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok: true, json: async () => ({ success: true }) })),
    );
    expect(await verifyCaptcha("token")).toBe(true);
  });

  it("fails closed when Cloudflare reports failure", async () => {
    process.env.CAPTCHA_SECRET_KEY = "secret";
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok: true, json: async () => ({ success: false }) })),
    );
    expect(await verifyCaptcha("token")).toBe(false);
  });

  it("fails closed on a non-OK HTTP response", async () => {
    process.env.CAPTCHA_SECRET_KEY = "secret";
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok: false, status: 500, json: async () => ({}) })),
    );
    expect(await verifyCaptcha("token")).toBe(false);
  });

  it("fails closed when fetch throws", async () => {
    process.env.CAPTCHA_SECRET_KEY = "secret";
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("network down");
      }),
    );
    expect(await verifyCaptcha("token")).toBe(false);
  });
});
