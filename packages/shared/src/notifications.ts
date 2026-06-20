/**
 * Outbox notification payloads (concept §11). The web app writes a
 * `Notification` row when a reviewer acts on a submission; the Discord bot
 * polls unread rows and DMs the applicant. The `Notification.type` column
 * discriminates which payload shape `payload` holds.
 */

export const NOTIFICATION_TYPES = ["status_change", "message", "submission_review"] as const;
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

export type NotificationPayload =
  | StatusChangeNotification
  | MessageNotification
  | SubmissionReviewNotification;
