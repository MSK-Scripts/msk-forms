import "server-only";

import { prisma } from "@msk-forms/db";

import { decryptSecret } from "@/lib/crypto";
import { getGuildByDomain, isPrimaryHostname } from "@/lib/custom-domain";

/** Decrypted per-guild Discord OAuth credentials. */
export interface GuildOAuth {
  clientId: string;
  clientSecret: string;
}

/** Per-guild Discord OAuth credentials for a guild, or null when not configured. */
export async function getGuildOAuth(guildId: string): Promise<GuildOAuth | null> {
  const guild = await prisma.guild.findUnique({
    where: { id: guildId },
    select: { oauthClientId: true, oauthClientSecret: true },
  });
  if (!guild?.oauthClientId || !guild.oauthClientSecret) return null;
  const clientSecret = decryptSecret(guild.oauthClientSecret);
  if (!clientSecret) return null;
  return { clientId: guild.oauthClientId, clientSecret };
}

/** Full OAuth config to drive the authorize + token exchange on a given host. */
export interface HostOAuth extends GuildOAuth {
  redirectUri: string;
}

/**
 * Resolve the Discord OAuth credentials to use for a request `host`:
 * - On a verified custom domain whose guild has its own OAuth app → those creds
 *   plus that host's callback as the redirect_uri (login completes on the custom
 *   domain, no cross-domain handoff).
 * - Otherwise → null, meaning "use the global app on the primary host".
 *
 * Login + callback both call this with their own host, so the authorize and the
 * token exchange always agree on client_id + redirect_uri (Discord requires it).
 */
export async function resolveHostOAuth(host: string | null): Promise<HostOAuth | null> {
  if (!host || isPrimaryHostname(host)) return null;
  const guild = await getGuildByDomain(host);
  if (!guild) return null;
  const oauth = await getGuildOAuth(guild.id);
  if (!oauth) return null;
  return { ...oauth, redirectUri: `https://${host}/api/auth/discord/callback` };
}
