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
 * Browser-bound: the token is stored with a `bind` nonce that the originating
 * browser also holds in a host-only `handoff_bind` cookie on the custom domain
 * (set by `/api/auth/start` before the OAuth round-trip). Redemption requires the
 * cookie to match, so a token leaked on its own (e.g. from an access log) is not
 * a usable credential.
 *
 * Fail-CLOSED: without Redis there is no token store, so the handoff simply does
 * not happen (the user stays logged in on the primary host, as before). The token
 * never carries session data — only a random key bound server-side to a user id.
 */
const PREFIX = "handoff:";
const TTL_SECONDS = 60;

/** Generate a binding nonce for the `handoff_bind` cookie (32 hex chars). */
export function generateBindNonce(): string {
  return randomBytes(16).toString("hex");
}

/** True for a well-formed bind nonce (defends the cookie/param against junk). */
export function isValidBindNonce(value: string | null | undefined): value is string {
  return typeof value === "string" && /^[a-f0-9]{32}$/.test(value);
}

/** What a redeemed handoff token resolves to. */
export interface HandoffClaims {
  userId: string;
  /** Binding nonce that must match the `handoff_bind` cookie, or null (unbound). */
  bind: string | null;
}

/**
 * Mint a one-time handoff token bound to `userId` (and a `bind` nonce), or null
 * when Redis is unavailable.
 */
export async function createHandoffToken(userId: string, bind: string | null): Promise<string | null> {
  const redis = getRedis();
  if (!redis) return null;
  const token = randomBytes(32).toString("hex");
  try {
    await redis.set(`${PREFIX}${token}`, JSON.stringify({ userId, bind }), "EX", TTL_SECONDS);
    return token;
  } catch (err) {
    console.error("[auth-handoff] failed to store token:", (err as Error).message);
    return null;
  }
}

/**
 * Redeem a handoff token, returning its claims (and atomically deleting it so it
 * can't be reused), or null when missing/expired/Redis-down/malformed.
 */
export async function redeemHandoffToken(token: string): Promise<HandoffClaims | null> {
  const redis = getRedis();
  if (!redis) return null;
  try {
    const raw = await redis.getdel(`${PREFIX}${token}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<HandoffClaims>;
    if (typeof parsed.userId !== "string") return null;
    return { userId: parsed.userId, bind: typeof parsed.bind === "string" ? parsed.bind : null };
  } catch (err) {
    console.error("[auth-handoff] failed to redeem token:", (err as Error).message);
    return null;
  }
}
