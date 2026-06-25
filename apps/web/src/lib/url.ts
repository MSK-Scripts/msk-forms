/**
 * The app's external base URL. Behind the Apache reverse proxy, a request's
 * `request.url` resolves to the internal loopback address (127.0.0.1:3008),
 * so building redirects from it leaks `http://localhost:3008`. Use APP_URL —
 * the canonical public origin — as the base for any browser-facing URL.
 */
export function appBaseUrl(): string {
  return process.env.APP_URL ?? "http://localhost:3000";
}

/** Resolve a relative path against the public origin. */
export function absoluteUrl(path: string): URL {
  return new URL(path, appBaseUrl());
}

/**
 * Sanitize a user-supplied post-login `returnTo` into a safe same-origin path,
 * or the fallback. Rejects anything that could become an off-origin URL once
 * resolved: it must start with a single `/`, must not be protocol-relative
 * (`//`), must contain no backslash (WHATWG `new URL()` normalizes `\` → `/`
 * for http(s), so `/\evil.com` would otherwise resolve to `https://evil.com/`),
 * and no control chars (tab/newline/…) that can confuse URL parsing.
 */
export function safeRelativePath(raw: string | null | undefined, fallback = "/"): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return fallback;
  if (raw.includes("\\")) return fallback;
  for (let i = 0; i < raw.length; i += 1) {
    const c = raw.charCodeAt(i);
    if (c < 0x20 || c === 0x7f) return fallback; // reject control chars
  }
  return raw;
}

/** MSK Forms bot — public Discord application id (overridable via env). */
const BOT_APP_ID = "1517520313200676994";
/** View Channels + Send Messages + Embed Links — the minimum for `/forms post`. */
const BOT_PERMISSIONS = "19456";

/** OAuth2 URL to invite the MSK Forms bot to a Discord server. */
export function botInviteUrl(): string {
  const params = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID || BOT_APP_ID,
    scope: "bot applications.commands",
    permissions: BOT_PERMISSIONS,
  });
  return `https://discord.com/oauth2/authorize?${params.toString()}`;
}
