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
 * Guild activity-log actions. The web app (and bot) enqueue a channel-targeted
 * `log` notification for each of these; the bot posts a one-line embed into the
 * guild's configured log channel (`botConfig.logChannelId`). Dropped silently
 * when no log channel is set — so enqueuing is always safe.
 */
export const LOG_ACTIONS = [
  // Submission lifecycle
  "submission_created",
  "status_changed",
  "message_sent",
  "submission_withdrawn",
  "submission_deleted",
  // Discord role grant on acceptance
  "role_granted",
  // Form administration
  "form_created",
  "form_updated",
  "form_deleted",
  "form_posted",
  // Team & configuration
  "member_added",
  "member_role_changed",
  "member_removed",
  "bot_config_updated",
  "branding_updated",
  "domain_updated",
] as const;
export type LogAction = (typeof LOG_ACTIONS)[number];

/**
 * Channel-targeted activity-log entry (the `Notification` carries `guildId`, not
 * a recipient user). Every field except `action` is optional so a single shape
 * covers all event kinds; the bot renders whatever is present.
 */
export interface LogNotification {
  action: LogAction;
  /** Human-readable actor (reviewer/applicant/"Bot"/"Automation"). */
  actorName?: string;
  formTitle?: string;
  /** Submission UUID — when present the embed links to the dashboard detail. */
  submissionId?: string;
  applicantName?: string;
  fromStatus?: string;
  toStatus?: string;
  toStatusLabel?: string;
  /** Free-text extra context (role name, member, changed field, …). */
  detail?: string;
}

export type NotificationPayload =
  | StatusChangeNotification
  | MessageNotification
  | SubmissionReviewNotification
  | LogNotification;
