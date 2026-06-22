import "server-only";

import { createHmac } from "node:crypto";

/**
 * Short-lived HMAC token authorizing a reviewer to subscribe to a guild's
 * realtime topic (`guild:<guildId>`). The realtime service verifies it with the
 * same `REALTIME_TOKEN_SECRET`. Returns null when the secret isn't configured —
 * the dashboard live feed is then simply off (fail-soft, same as captcha/S3).
 */
export function signGuildRealtimeToken(guildId: string, ttlSeconds = 3600): string | null {
  const secret = process.env.REALTIME_TOKEN_SECRET;
  if (!secret) return null;
  const payload = Buffer.from(
    JSON.stringify({ g: guildId, exp: Math.floor(Date.now() / 1000) + ttlSeconds }),
  ).toString("base64url");
  const sig = createHmac("sha256", secret).update(payload).digest("hex");
  return `${payload}.${sig}`;
}
