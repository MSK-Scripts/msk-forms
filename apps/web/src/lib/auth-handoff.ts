import "server-only";

import { randomBytes } from "node:crypto";

import { getRedis } from "@/lib/redis";

/**
 * Cross-domain login handoff (custom domains). A session cookie set on the
 * primary host can't be read on a customer's custom domain (different registrable
 * domain). After OAuth completes on the primary host we mint a short-lived,
 * single-use token, redirect to the custom domain's `/api/auth/handoff`, and that
 * route redeems the token and establishes a session there.
 *
 * Fail-CLOSED: without Redis there is no token store, so the handoff simply does
 * not happen (the user stays logged in on the primary host, as before). The token
 * never carries session data — only a random key bound server-side to a user id.
 */
const PREFIX = "handoff:";
const TTL_SECONDS = 60;

/** Mint a one-time handoff token for `userId`, or null when Redis is unavailable. */
export async function createHandoffToken(userId: string): Promise<string | null> {
  const redis = getRedis();
  if (!redis) return null;
  const token = randomBytes(32).toString("hex");
  try {
    await redis.set(`${PREFIX}${token}`, userId, "EX", TTL_SECONDS);
    return token;
  } catch {
    return null;
  }
}

/**
 * Redeem a handoff token, returning the bound user id (and atomically deleting it
 * so it can't be reused), or null when missing/expired/Redis-down.
 */
export async function redeemHandoffToken(token: string): Promise<string | null> {
  const redis = getRedis();
  if (!redis) return null;
  try {
    const userId = await redis.getdel(`${PREFIX}${token}`);
    return userId || null;
  } catch {
    return null;
  }
}
