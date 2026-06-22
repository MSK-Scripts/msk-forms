/**
 * Discord OAuth2 helpers (concept §17). Server-only — never import from a
 * Client Component, this reads DISCORD_CLIENT_SECRET.
 */

const DISCORD_API = "https://discord.com/api/v10";

/** OAuth2 scopes we request for web login: identity, email, guild list. */
export const OAUTH_SCOPES = ["identify", "email", "guilds"] as const;

export interface DiscordTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}

export interface DiscordUser {
  id: string;
  username: string;
  /** Avatar hash, or null when the user has no custom avatar. */
  avatar: string | null;
  email?: string | null;
  /** Discord locale, e.g. "de", "en-US". */
  locale?: string;
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

/** Build the Discord authorize URL the user is redirected to on login. */
export function buildAuthorizeUrl(state: string): string {
  const url = new URL(`${DISCORD_API}/oauth2/authorize`);
  url.searchParams.set("client_id", requireEnv("DISCORD_CLIENT_ID"));
  url.searchParams.set("redirect_uri", requireEnv("DISCORD_REDIRECT_URI"));
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", OAUTH_SCOPES.join(" "));
  url.searchParams.set("state", state);
  url.searchParams.set("prompt", "none");
  return url.toString();
}

/** Exchange an authorization code for an access token. */
export async function exchangeCode(code: string): Promise<DiscordTokenResponse> {
  const body = new URLSearchParams({
    client_id: requireEnv("DISCORD_CLIENT_ID"),
    client_secret: requireEnv("DISCORD_CLIENT_SECRET"),
    grant_type: "authorization_code",
    code,
    redirect_uri: requireEnv("DISCORD_REDIRECT_URI"),
  });

  const res = await fetch(`${DISCORD_API}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Discord token exchange failed: ${res.status} ${await res.text()}`);
  }
  return res.json() as Promise<DiscordTokenResponse>;
}

/** Fetch the authenticated user's profile with a bearer access token. */
export async function fetchDiscordUser(accessToken: string): Promise<DiscordUser> {
  const res = await fetch(`${DISCORD_API}/users/@me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Discord user fetch failed: ${res.status} ${await res.text()}`);
  }
  return res.json() as Promise<DiscordUser>;
}

/**
 * Fetch the Discord guild ids the authenticated user is a member of (via the
 * `guilds` scope). Best-effort — returns [] on any error so login never fails.
 */
export async function fetchDiscordGuildIds(accessToken: string): Promise<string[]> {
  try {
    const res = await fetch(`${DISCORD_API}/users/@me/guilds`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
    if (!res.ok) return [];
    const guilds = (await res.json()) as { id: string }[];
    return Array.isArray(guilds) ? guilds.map((g) => g.id) : [];
  } catch {
    return [];
  }
}

/**
 * Look up a Discord user by id using the bot token (for adding members by ID
 * before they've logged in). Returns null without a token or on any error — the
 * caller falls back to the raw id as a placeholder username.
 */
export async function fetchDiscordUserById(userId: string): Promise<DiscordUser | null> {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) return null;
  try {
    const res = await fetch(`${DISCORD_API}/users/${userId}`, {
      headers: { Authorization: `Bot ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as DiscordUser;
  } catch {
    return null;
  }
}

/** Resolve the full CDN avatar URL, or null to let the UI fall back. */
export function discordAvatarUrl(user: DiscordUser): string | null {
  if (!user.avatar) return null;
  const ext = user.avatar.startsWith("a_") ? "gif" : "png";
  return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${ext}?size=128`;
}

/** Map a Discord locale to one of our supported app locales. */
export function mapLocale(locale: string | undefined): "de" | "en" {
  return locale?.toLowerCase().startsWith("de") ? "de" : "en";
}
