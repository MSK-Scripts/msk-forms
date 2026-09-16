import "server-only";

import { DISCORD_WEBHOOK_URL_RE } from "@msk-forms/shared";

/**
 * Direct calls from the web app to a Discord channel webhook: checking that a
 * URL points at a real webhook before saving it, and the synchronous messages
 * the dashboard needs an immediate answer for (a test entry, the "removed"
 * notice). Regular log entries go through the bot's outbox instead.
 *
 * Every call re-checks the URL against the Discord pattern and refuses
 * redirects, so a stored value can never make the server fetch anything else.
 */

const TIMEOUT_MS = 5_000;

export type DiscordWebhookCheck =
  | { ok: true; name: string | null }
  | { ok: false; reason: "invalid" | "not_found" | "unreachable" };

async function call(url: string, init: RequestInit): Promise<Response | null> {
  if (!DISCORD_WEBHOOK_URL_RE.test(url)) return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, {
      ...init,
      redirect: "error",
      signal: controller.signal,
      headers: { "User-Agent": "MSK-Forms-Webhook/1", ...(init.headers ?? {}) },
    });
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** GET the webhook: Discord answers with its name when URL and token are valid. */
export async function checkDiscordWebhook(url: string): Promise<DiscordWebhookCheck> {
  if (!DISCORD_WEBHOOK_URL_RE.test(url)) return { ok: false, reason: "invalid" };
  const res = await call(url, { method: "GET" });
  if (!res) return { ok: false, reason: "unreachable" };
  if (res.status === 401 || res.status === 404) return { ok: false, reason: "not_found" };
  if (!res.ok) return { ok: false, reason: "unreachable" };
  const body = (await res.json().catch(() => null)) as { name?: unknown } | null;
  return { ok: true, name: typeof body?.name === "string" ? body.name : null };
}

export interface SimpleEmbed {
  title: string;
  description?: string;
  color: number;
  fields?: { name: string; value: string; inline?: boolean }[];
}

/** POST one embed. Returns null on success, or a short reason. */
export async function postDiscordEmbed(url: string, embed: SimpleEmbed): Promise<string | null> {
  const res = await call(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      embeds: [{ ...embed, timestamp: new Date().toISOString(), footer: { text: "MSK Forms" } }],
      allowed_mentions: { parse: [] },
    }),
  });
  if (!res) return "unreachable";
  if (res.ok) return null;
  if (res.status === 401 || res.status === 404) return "not_found";
  if (res.status === 429) return "rate_limited";
  return `HTTP ${res.status}`;
}

/** "name (<@id>)", the same attribution the log entries use. */
export function actorLine(user: { username: string; discordId: string }): string {
  return /^\d{17,20}$/.test(user.discordId)
    ? `${user.username} (<@${user.discordId}>)`
    : user.username;
}
