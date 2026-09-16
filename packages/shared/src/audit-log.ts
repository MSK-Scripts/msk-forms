import { z } from "zod";

import { LOG_ACTIONS, type LogAction } from "./notifications";
import { DISCORD_WEBHOOK_URL_RE } from "./webhooks";

/**
 * Audit-log webhooks: a guild points a Discord channel webhook at MSK Forms and
 * picks which activity-log actions it wants there. They are stored as `Webhook`
 * rows with `kind = "audit"` and one `log.<action>` entry in `events` per
 * subscribed action, so they reuse the webhook outbox (retries, backoff,
 * delivery status) instead of a second delivery pipeline.
 *
 * Unlike the generic event webhooks these are not a paid feature: being able to
 * reconstruct who changed what, and when, is basic hygiene for every team.
 */

/** Webhook `kind` for audit-log hooks (generic hooks use `"event"`). */
export const AUDIT_WEBHOOK_KIND = "audit";
/** Webhook `kind` for the generic submission-event hooks. */
export const EVENT_WEBHOOK_KIND = "event";

/** Prefix that turns a log action into a webhook event name. */
export const AUDIT_EVENT_PREFIX = "log.";

/** Max audit-log webhooks per guild. */
export const MAX_AUDIT_WEBHOOKS = 10;

/** `status_changed` → `log.status_changed`. */
export function auditEvent(action: LogAction): string {
  return `${AUDIT_EVENT_PREFIX}${action}`;
}

/** `log.status_changed` → `status_changed`; null for anything else. */
export function auditActionFromEvent(event: string): LogAction | null {
  if (!event.startsWith(AUDIT_EVENT_PREFIX)) return null;
  const action = event.slice(AUDIT_EVENT_PREFIX.length);
  return (LOG_ACTIONS as readonly string[]).includes(action) ? (action as LogAction) : null;
}

/**
 * The actions grouped the way the dashboard offers them. Every action appears in
 * exactly one group (enforced by a unit test), so a new action that is not
 * placed here fails CI instead of silently being unselectable.
 */
export const LOG_ACTION_GROUPS = {
  submissions: [
    "submission_created",
    "status_changed",
    "message_sent",
    "note_added",
    "role_granted",
    "submission_archived",
    "submission_restored",
    "submission_withdrawn",
    "submission_deleted",
    "submissions_exported",
  ],
  forms: ["form_created", "form_updated", "form_deleted", "form_posted", "categories_updated"],
  team: ["member_added", "member_role_changed", "member_access_changed", "member_removed"],
  settings: [
    "bot_config_updated",
    "branding_updated",
    "statuses_updated",
    "status_messages_updated",
    "domain_updated",
    "handle_updated",
    "login_config_updated",
    "captcha_updated",
  ],
  security: [
    "webhook_created",
    "webhook_updated",
    "webhook_deleted",
    "api_key_created",
    "api_key_revoked",
    "plan_changed",
    "dpa_accepted",
  ],
} as const satisfies Record<string, readonly LogAction[]>;

export type LogActionGroup = keyof typeof LOG_ACTION_GROUPS;

/**
 * Actions that change who can do what or where data goes. Pre-selected together
 * with everything else, but called out in the UI: an admin who removes these
 * from the log is removing the trail of their own changes.
 */
export const SECURITY_LOG_ACTIONS: readonly LogAction[] = LOG_ACTION_GROUPS.security;

const logActionSchema = z.enum(LOG_ACTIONS);

/** An audit-log webhook as submitted from the dashboard. */
export const auditWebhookInputSchema = z.object({
  /** Optional label, e.g. "Mod log". Shown in the dashboard only. */
  name: z.string().trim().max(80).optional(),
  url: z
    .string()
    .trim()
    .max(2000)
    .regex(DISCORD_WEBHOOK_URL_RE, "Enter a valid Discord channel webhook URL."),
  actions: z
    .array(logActionSchema)
    .min(1, "Select at least one thing to log.")
    .transform((actions) => [...new Set(actions)]),
  /** Optional form to scope form-related entries to; null = every form. */
  formId: z.string().uuid().nullish(),
});
export type AuditWebhookInput = z.infer<typeof auditWebhookInputSchema>;

/** Editing an existing audit hook: the URL (a secret) is not resent. */
export const auditWebhookUpdateSchema = z
  .object({
    name: z.string().trim().max(80).nullish(),
    actions: z
      .array(logActionSchema)
      .min(1, "Select at least one thing to log.")
      .transform((actions) => [...new Set(actions)]),
    formId: z.string().uuid().nullish(),
    active: z.boolean(),
  })
  .partial();
export type AuditWebhookUpdate = z.infer<typeof auditWebhookUpdateSchema>;

/**
 * A Discord webhook URL embeds its token, which is enough to post into the
 * channel. The dashboard only ever shows the masked form.
 */
export function maskDiscordWebhookUrl(url: string): string {
  const match = /^(https:\/\/[^/]+\/api(?:\/v\d+)?\/webhooks\/\d+)\/[A-Za-z0-9_-]+$/.exec(url);
  return match ? `${match[1]}/••••••••` : "••••••••";
}
