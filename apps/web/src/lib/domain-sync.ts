import "server-only";

import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

/**
 * Trigger file watched by the root `msk-forms-domains.path` systemd unit. Touching
 * it makes the custom-domain sync (Apache vhost + mod_md cert) run within ~1s,
 * instead of waiting up to 3 minutes for the periodic timer. Configurable so dev
 * and tests can point it elsewhere; the path unit watches the same location.
 */
const TRIGGER_FILE = process.env.DOMAIN_SYNC_TRIGGER ?? "/opt/msk-forms/var/domain-sync.request";

/**
 * Request an immediate custom-domain sync by touching the trigger file. Fail-soft:
 * a missing directory or permissions error must never break the API response —
 * the periodic timer is the safety net. Best-effort and fire-and-forget.
 */
export async function requestDomainSync(): Promise<void> {
  try {
    await mkdir(dirname(TRIGGER_FILE), { recursive: true });
    // Content is irrelevant — the path unit reacts to the modification. Write a
    // timestamp so the file changes on every request (PathModified triggers).
    await writeFile(TRIGGER_FILE, `${new Date().toISOString()}\n`);
  } catch {
    // Sync will still happen on the next timer tick — never surface this.
  }
}
