import "server-only";

import { getRedis } from "./redis";

export { clientIp } from "./client-ip";

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  /** Seconds until the current window resets (for a Retry-After header). */
  retryAfter: number;
}

// Atomic fixed-window counter: INCR, set the TTL only on the first hit of a
// window, and return the count plus the remaining TTL.
const FIXED_WINDOW = `
local current = redis.call('INCR', KEYS[1])
if current == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]) end
return {current, redis.call('TTL', KEYS[1])}
`;

/**
 * Fixed-window rate limit keyed by `key`. **Fails open**: if Redis is
 * unconfigured or unreachable, the request is allowed — keeping submissions
 * available matters more than strict limiting.
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<RateLimitResult> {
  const redis = getRedis();
  if (!redis) return { allowed: true, remaining: limit, retryAfter: 0 };

  try {
    const [count, ttl] = (await redis.eval(
      FIXED_WINDOW,
      1,
      `rl:${key}`,
      String(windowSeconds),
    )) as [number, number];
    return {
      allowed: count <= limit,
      remaining: Math.max(0, limit - count),
      retryAfter: ttl > 0 ? ttl : windowSeconds,
    };
  } catch (err) {
    console.error("[rate-limit] redis error, failing open:", (err as Error).message);
    return { allowed: true, remaining: limit, retryAfter: 0 };
  }
}
