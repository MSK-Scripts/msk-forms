import { EventEmitter } from "node:events";

import { afterEach, describe, expect, it, vi } from "vitest";

import { getRedis } from "./redis";
import { rateLimit } from "./rate-limit";
import { whenReady } from "./redis-ready";

vi.mock("./redis", () => ({ getRedis: vi.fn() }));

const mockedGetRedis = vi.mocked(getRedis);

/**
 * Minimal stand-in for an ioredis client with `enableOfflineQueue: false`:
 * commands sent before the connection is ready are rejected, exactly like the
 * "Stream isn't writeable" error seen on the server.
 */
class FakeRedis extends EventEmitter {
  status: string;
  eval = vi.fn(async () => {
    if (this.status !== "ready") {
      throw new Error("Stream isn't writeable and enableOfflineQueue options is false");
    }
    return [1, 60];
  });

  constructor(status: string) {
    super();
    this.status = status;
  }

  becomeReady(): void {
    this.status = "ready";
    this.emit("ready");
  }
}

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  mockedGetRedis.mockReset();
});

describe("rateLimit on a client that is still connecting", () => {
  it("waits for the connection and counts the very first request", async () => {
    const client = new FakeRedis("connecting");
    mockedGetRedis.mockReturnValue(client as never);
    setTimeout(() => client.becomeReady(), 5);

    const r = await rateLimit("k", 5, 60);

    expect(client.eval).toHaveBeenCalledTimes(1);
    expect(r.allowed).toBe(true);
    expect(r.remaining).toBe(4);
    expect(r.retryAfter).toBe(60);
  });

  it("does not wait while reconnecting during an outage and fails open at once", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const client = new FakeRedis("reconnecting");
    mockedGetRedis.mockReturnValue(client as never);

    const r = await rateLimit("k", 5, 60);

    expect(client.listenerCount("ready")).toBe(0);
    expect(r.allowed).toBe(true);
    expect(r.remaining).toBe(5);
  });
});

describe("whenReady", () => {
  it("resolves immediately when the client is ready", async () => {
    const client = new FakeRedis("ready");
    await whenReady(client, 1000);
    expect(client.listenerCount("ready")).toBe(0);
  });

  it("gives up after the timeout and removes its listener", async () => {
    vi.useFakeTimers();
    const client = new FakeRedis("connecting");
    const pending = whenReady(client, 1000);
    expect(client.listenerCount("ready")).toBe(1);

    await vi.advanceTimersByTimeAsync(1000);
    await pending;

    expect(client.listenerCount("ready")).toBe(0);
    expect(client.status).toBe("connecting");
  });
});
