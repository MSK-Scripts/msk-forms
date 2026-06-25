import "server-only";

import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

/**
 * Symmetric encryption for secrets stored at rest (e.g. per-guild Discord OAuth
 * client secrets). AES-256-GCM with a key derived from SESSION_SECRET — no new
 * required env. Output format: `iv.tag.ciphertext`, all base64.
 */
function key(): Buffer {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must be set (>= 32 chars) to encrypt secrets.");
  }
  // Domain-separated from the session-cookie use of the same secret.
  return createHash("sha256").update(`${secret}:guild-secret-v1`).digest();
}

/** Encrypt a plaintext secret. Returns `iv.tag.ciphertext` (base64 parts). */
export function encryptSecret(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const ct = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64")}.${tag.toString("base64")}.${ct.toString("base64")}`;
}

/** Decrypt a value produced by {@link encryptSecret}, or null if it can't be read. */
export function decryptSecret(enc: string): string | null {
  try {
    const [ivB, tagB, ctB] = enc.split(".");
    if (!ivB || !tagB || !ctB) return null;
    const decipher = createDecipheriv("aes-256-gcm", key(), Buffer.from(ivB, "base64"));
    decipher.setAuthTag(Buffer.from(tagB, "base64"));
    return Buffer.concat([
      decipher.update(Buffer.from(ctB, "base64")),
      decipher.final(),
    ]).toString("utf8");
  } catch {
    return null;
  }
}
