/**
 * Outbox notification payloads (concept §11). The web app writes a
 * `Notification` row when a reviewer acts on a submission; the Discord bot
 * polls unread rows and DMs the applicant. The `Notification.type` column
 * discriminates which payload shape `payload` holds.
 */

export const NOTIFICATION_TYPES = ["status_change", "message"] as const;
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

export type NotificationPayload = StatusChangeNotification | MessageNotification;
