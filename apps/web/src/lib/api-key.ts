import "server-only";

import { createHash, randomBytes } from "node:crypto";

import { prisma } from "@msk-forms/db";

/** Public prefix so keys are recognisable (and rejectable early). */
const PREFIX = "mskf_";

/** SHA-256 of the plaintext key — only the hash is stored. */
export function hashApiKey(plain: string): string {
  return createHash("sha256").update(plain).digest("hex");
}

/** Generate a new API key: the plaintext (shown to the user once) and its hash. */
export function generateApiKey(): { plain: string; hash: string } {
  const plain = PREFIX + randomBytes(24).toString("hex");
  return { plain, hash: hashApiKey(plain) };
}

/**
 * Authenticate a `Authorization: Bearer <key>` header against the api_keys table.
 * Returns the key's guild (and key id) or null. Stamps `lastUsedAt` best-effort.
 */
export async function authenticateApiKey(
  authHeader: string | null,
): Promise<{ keyId: string; guildId: string } | null> {
  const token = /^Bearer\s+(\S+)$/i.exec((authHeader ?? "").trim())?.[1];
  if (!token || !token.startsWith(PREFIX)) return null;

  const key = await prisma.apiKey.findUnique({
    where: { hashedKey: hashApiKey(token) },
    select: { id: true, guildId: true },
  });
  if (!key) return null;

  void prisma.apiKey
    .update({ where: { id: key.id }, data: { lastUsedAt: new Date() } })
    .catch(() => undefined);
  return { keyId: key.id, guildId: key.guildId };
}
