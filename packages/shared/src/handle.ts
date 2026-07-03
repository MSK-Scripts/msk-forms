import { z } from "zod";

/**
 * Reserved handles that must not be claimed by a guild. Most are also explicit
 * top-level routes (which win over the dynamic `/[handle]` segment anyway), but
 * reserving them keeps a guild from picking a handle that could never resolve.
 */
export const RESERVED_HANDLES = new Set<string>([
  "api",
  "dashboard",
  "f",
  "g",
  "s",
  "stats",
  "terms",
  "pricing",
  "offline",
  "login",
  "logout",
  "auth",
  "admin",
  "app",
  "static",
  "public",
  "assets",
  "icons",
  "manifest",
  "sw",
  "robots",
  "sitemap",
  "favicon",
  "_next",
  "well-known",
]);

/** Lowercase + trim a raw handle input before validation/storage. */
export function normalizeHandle(raw: string): string {
  return raw.trim().toLowerCase();
}

export function isReservedHandle(handle: string): boolean {
  return RESERVED_HANDLES.has(handle);
}

/**
 * A guild's public hub handle: 2-32 chars, lowercase letters/numbers/hyphens,
 * no leading/trailing hyphen, not a reserved word. Resolves at
 * `forms.msk-scripts.de/<handle>`.
 */
export const handleSchema = z
  .string()
  .min(2)
  .max(32)
  .regex(
    /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/,
    "Use lowercase letters, numbers and hyphens (no leading or trailing hyphen).",
  )
  .refine((h) => !isReservedHandle(h), "That handle is reserved.");
