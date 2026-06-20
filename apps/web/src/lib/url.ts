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
