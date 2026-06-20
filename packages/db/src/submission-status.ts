import { Prisma, prisma } from "./index";

export interface StatusChangeOutboxNotification {
  /** Discord-linked applicant to DM (omit for anonymous submissions). */
  userId: string;
  /** Notification type, e.g. "status_change". */
  type: string;
  /** Serialized notification payload (shape owned by @msk-forms/shared). */
  payload: unknown;
}

export interface ChangeSubmissionStatusArgs {
  submissionId: string;
  /** Target status key (already validated against the allowed set by the caller). */
  toStatus: string;
  /** Reviewer who triggered the change, or null for bot/system actions. */
  actorUserId?: string | null;
  /** When set, queue an outbox DM for the applicant in the same transaction. */
  notify?: StatusChangeOutboxNotification | null;
}

export interface ChangeSubmissionStatusResult {
  /** False if the submission was already at `toStatus` (or lost a race). */
  changed: boolean;
  /** The status before the change (only meaningful when `changed` is true). */
  fromStatus: string | null;
}

/**
 * Idempotent, race-safe status transition shared by the web review route and
 * the bot's Accept/Reject buttons. Reads the current status, then writes guarded
 * by that exact value (`updateMany ... where status = current`) so two concurrent
 * reviewers can't both record the transition. Writes the status-change event and
 * (optionally) an outbox notification in the same transaction. A no-op when the
 * submission is already at `toStatus`.
 */
export async function changeSubmissionStatus(
  args: ChangeSubmissionStatusArgs,
): Promise<ChangeSubmissionStatusResult> {
  const { submissionId, toStatus, actorUserId = null, notify = null } = args;

  return prisma.$transaction(async (tx) => {
    const current = await tx.submission.findUnique({
      where: { id: submissionId },
      select: { status: true },
    });
    if (!current || current.status === toStatus) {
      return { changed: false, fromStatus: current?.status ?? null };
    }

    // Guarded write: only succeeds if the status is still what we just read.
    const updated = await tx.submission.updateMany({
      where: { id: submissionId, status: current.status },
      data: { status: toStatus },
    });
    if (updated.count === 0) {
      return { changed: false, fromStatus: null }; // lost the race to another reviewer
    }

    await tx.submissionEvent.create({
      data: {
        submissionId,
        actorUserId,
        type: "status_change",
        fromStatus: current.status,
        toStatus,
        visibility: "public",
      },
    });

    if (notify) {
      await tx.notification.create({
        data: {
          userId: notify.userId,
          type: notify.type,
          payload: notify.payload as Prisma.InputJsonValue,
        },
      });
    }

    return { changed: true, fromStatus: current.status };
  });
}
