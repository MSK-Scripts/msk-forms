import "server-only";

import { prisma } from "@msk-forms/db";

import { decryptSecret } from "@/lib/crypto";

/**
 * Per-guild Cloudflare Turnstile (concept §26). A guild configures its own
 * Turnstile widget (bound to its custom domain in the Cloudflare dashboard), so
 * the captcha works on the custom domain where the global site key can't. Active
 * only when BOTH the site key and the (encrypted) secret are set.
 */

/** The guild's Turnstile site key for the client widget, or null when off. */
export async function getGuildCaptchaSiteKey(guildId: string): Promise<string | null> {
  const guild = await prisma.guild.findUnique({
    where: { id: guildId },
    select: { captchaSiteKey: true, captchaSecret: true },
  });
  return guild?.captchaSiteKey && guild.captchaSecret ? guild.captchaSiteKey : null;
}

/** The guild's decrypted Turnstile secret (server-side verification), or null. */
export async function getGuildCaptchaSecret(guildId: string): Promise<string | null> {
  const guild = await prisma.guild.findUnique({
    where: { id: guildId },
    select: { captchaSecret: true },
  });
  return guild?.captchaSecret ? decryptSecret(guild.captchaSecret) : null;
}
