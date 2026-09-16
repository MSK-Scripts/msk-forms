/**
 * Outbox notification payloads (concept §11). The web app writes a
 * `Notification` row when a reviewer acts on a submission; the Discord bot
 * polls unread rows and DMs the applicant. The `Notification.type` column
 * discriminates which payload shape `payload` holds.
 */

export const NOTIFICATION_TYPES = [
  "status_change",
  "message",
  "submission_review",
  "log",
] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

interface BaseNotification {
  /** The submission's UUID — used to build the public status link. */
  submissionId: string;
  /** The form's title, for context in the DM. */
  formTitle: string;
}

/** A reviewer moved the submission to a new status. */
export interface StatusChangeNotification extends BaseNotification {
  toStatus: string;
  toStatusLabel: string;
}

/** A reviewer sent the applicant a public message. */
export interface MessageNotification extends BaseNotification {
  message: string;
}

/**
 * A new submission to announce in the guild's review channel. Channel-targeted
 * (the Notification carries `guildId`, not a recipient user).
 */
export interface SubmissionReviewNotification {
  submissionId: string;
  formTitle: string;
  applicantName: string;
  /** Short "Field: value" lines for an at-a-glance preview in the embed. */
  preview: string[];
}

/**
 * Guild activity-log actions. Every tracked change enqueues one `log` entry via
 * `enqueueGuildLog` (`@msk-forms/db`). It fans out to two independent sinks:
 *  - the bot-posted log channel (`botConfig.logChannelId`), which receives every
 *    action and is dropped silently when unset, and
 *  - the guild's audit-log Discord webhooks, each receiving only the actions it
 *    subscribed to (see `audit-log.ts`).
 * So enqueuing is always safe. Keep `LOG_ACTION_GROUPS` in sync when adding one.
 */
export const LOG_ACTIONS = [
  // Submission lifecycle
  "submission_created",
  "status_changed",
  "message_sent",
  "note_added",
  "submission_archived",
  "submission_restored",
  "submission_withdrawn",
  "submission_deleted",
  "submissions_exported",
  // Discord role grant on acceptance
  "role_granted",
  // Form administration
  "form_created",
  "form_updated",
  "form_archived",
  "form_restored",
  "form_deleted",
  "form_posted",
  "categories_updated",
  // Team & access
  "member_added",
  "member_role_changed",
  "member_access_changed",
  "member_removed",
  // Configuration
  "bot_config_updated",
  "branding_updated",
  "statuses_updated",
  "status_messages_updated",
  "domain_updated",
  "handle_updated",
  "login_config_updated",
  "captcha_updated",
  // Integrations & security
  "webhook_created",
  "webhook_updated",
  "webhook_deleted",
  "api_key_created",
  "api_key_revoked",
  "form_delete_setting_updated",
  // Plan & agreements
  "plan_changed",
  "dpa_accepted",
] as const;
export type LogAction = (typeof LOG_ACTIONS)[number];

/**
 * Channel-targeted activity-log entry (the `Notification` carries `guildId`, not
 * a recipient user). Every field except `action` is optional so a single shape
 * covers all event kinds; the renderers show whatever is present.
 */
export interface LogNotification {
  action: LogAction;
  /** Human-readable actor (reviewer/applicant/"Bot"/"Automation"). */
  actorName?: string;
  /**
   * The actor's Discord user ID, when the actor is a person. Rendered as a
   * mention next to the name, so the entry stays attributable even after the
   * account renames itself.
   */
  actorId?: string;
  formTitle?: string;
  /** The form this entry concerns; lets form-scoped audit webhooks filter. */
  formId?: string;
  /** Submission UUID — when present the embed links to the dashboard detail. */
  submissionId?: string;
  applicantName?: string;
  fromStatus?: string;
  toStatus?: string;
  toStatusLabel?: string;
  /** Free-text extra context (role name, member, changed field, …). */
  detail?: string;
  /**
   * ISO-8601 time the change happened. Stamped at enqueue time, so an entry
   * that is delivered late (retries, rate limits) still shows when it happened.
   */
  at?: string;
}

export type NotificationPayload =
  | StatusChangeNotification
  | MessageNotification
  | SubmissionReviewNotification
  | LogNotification;
