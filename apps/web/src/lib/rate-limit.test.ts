import { afterEach, describe, expect, it, vi } from "vitest";

import { getRedis } from "./redis";
import { rateLimit } from "./rate-limit";

// Control the Redis singleton without a real connection.
vi.mock("./redis", () => ({ getRedis: vi.fn() }));

const mockedGetRedis = vi.mocked(getRedis);

afterEach(() => {
  vi.restoreAllMocks();
  mockedGetRedis.mockReset();
});

describe("rateLimit", () => {
  it("fails open (allows) when Redis is not configured", async () => {
    mockedGetRedis.mockReturnValue(null);
    const r = await rateLimit("k", 5, 60);
    expect(r.allowed).toBe(true);
    expect(r.remaining).toBe(5);
  });

  it("fails open when the Redis command throws", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    mockedGetRedis.mockReturnValue({
      eval: vi.fn(async () => {
        throw new Error("redis down");
      }),
    } as never);
    const r = await rateLimit("k", 5, 60);
    expect(r.allowed).toBe(true);
  });

  it("allows while under the limit and reports remaining", async () => {
    mockedGetRedis.mockReturnValue({ eval: vi.fn(async () => [3, 42]) } as never);
    const r = await rateLimit("k", 5, 60);
    expect(r.allowed).toBe(true);
    expect(r.remaining).toBe(2);
    expect(r.retryAfter).toBe(42);
  });

  it("blocks once the count exceeds the limit", async () => {
    mockedGetRedis.mockReturnValue({ eval: vi.fn(async () => [6, 30]) } as never);
    const r = await rateLimit("k", 5, 60);
    expect(r.allowed).toBe(false);
    expect(r.remaining).toBe(0);
    expect(r.retryAfter).toBe(30);
  });

  it("allows exactly at the limit boundary", async () => {
    mockedGetRedis.mockReturnValue({ eval: vi.fn(async () => [5, 10]) } as never);
    const r = await rateLimit("k", 5, 60);
    expect(r.allowed).toBe(true);
    expect(r.remaining).toBe(0);
  });

  it("falls back to the window when TTL is unavailable", async () => {
    mockedGetRedis.mockReturnValue({ eval: vi.fn(async () => [6, -1]) } as never);
    const r = await rateLimit("k", 5, 90);
    expect(r.retryAfter).toBe(90);
  });
});
