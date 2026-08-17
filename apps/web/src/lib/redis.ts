import "server-only";

import Redis from "ioredis";

// Reuse a single connection across hot reloads in dev (mirrors the Prisma
// singleton). `undefined` = not yet resolved; `null` = no REDIS_URL configured.
const globalForRedis = globalThis as unknown as { redis?: Redis | null };

/**
 * Lazily-created Redis singleton, or `null` when REDIS_URL is unset (local dev
 * without Redis). Callers must treat `null` and command errors as "fail open".
 */
export function getRedis(): Redis | null {
  if (globalForRedis.redis !== undefined) return globalForRedis.redis;

  const url = process.env.REDIS_URL;
  if (!url) {
    globalForRedis.redis = null;
    return null;
  }

  const client = new Redis(url, {
    // ioredis 6 negotiates RESP3 by default. Stay on the v5 wire protocol: the
    // only consumer is the rate limiter's EVAL, which gains nothing from RESP3,
    // and a failed handshake would be silent (the limiter fails open, see
    // below). Revisit deliberately, with a check against the live server.
    protocol: 2,
    // Fail fast instead of queueing/retrying forever, so a Redis outage can't
    // stall request handling — the rate limiter just falls open.
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,
    retryStrategy: (times) => Math.min(times * 200, 2000),
  });

  // An unhandled 'error' event would crash the process — log and move on.
  client.on("error", (err: Error) => {
    console.error("[redis] connection error:", err.message);
  });

  globalForRedis.redis = client;
  return client;
}
