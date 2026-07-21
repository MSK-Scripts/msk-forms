import { enqueueGuildLog } from "./guild-log";
import { Prisma, prisma } from "./index";
import { enqueueWebhooks } from "./webhooks";

/** Read a trimmed non-empty string from a raw `{key: string}` JSON map. */
function messageFromMap(map: unknown, key: string): string | null {
  if (map && typeof map === "object" && !Array.isArray(map)) {
    const value = (map as Record<string, unknown>)[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

/**
 * Resolve the applicant message for a transition. An explicit `override` wins
 * (empty string opts out); otherwise the per-status template from the form's
 * settings (override) or the guild's `statusMessages`. Kept dependency-free so
 * `@msk-forms/db` need not import `@msk-forms/shared` (mirrors `resolveStatusMessage`).
 */
function resolveTransitionMessage(
  override: string | null | undefined,
  formStatusMessages: unknown,
  guildStatusMessages: unknown,
  statusKey: string,
): string | null {
  if (override !== undefined) {
    const trimmed = override?.trim();
    return trimmed ? trimmed : null;
  }
  return (
    messageFromMap(formStatusMessages, statusKey) ??
    messageFromMap(guildStatusMessages, statusKey)
  );
}

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
  /** Human-readable actor for the activity log (e.g. reviewer name, "Bot"). */
  actorName?: string | null;
  /** Status label for the activity log; falls back to the status key. */
  toStatusLabel?: string | null;
  /** When set, queue an outbox DM for the applicant in the same transaction. */
  notify?: StatusChangeOutboxNotification | null;
  /**
   * Visibility of the recorded status_change event. `"internal"` hides the
   * change from the applicant's status page (pair it with `notify: null` for a
   * fully silent change). Defaults to `"public"`.
   */
  eventVisibility?: "public" | "internal";
  /**
   * Applicant-facing message for this transition:
   *  - `undefined` (the default): auto-resolve the per-status template from the
   *    form's `settings.statusMessages` (override) or the guild's
   *    `statusMessages` for `toStatus`, if any.
   *  - a non-empty string: use it verbatim (a reviewer's custom override).
   *  - an empty string: send no message even if a template exists (opt out).
   * A resolved public message is recorded as a `message` event and, for a linked
   * applicant, delivered as the DM instead of the generic status-change DM.
   */
  applicantMessage?: string | null;
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
  const {
    submissionId,
    toStatus,
    actorUserId = null,
    actorName = null,
    toStatusLabel = null,
    notify = null,
    eventVisibility = "public",
    applicantMessage,
  } = args;

  return prisma.$transaction(async (tx) => {
    const current = await tx.submission.findUnique({
      where: { id: submissionId },
      select: {
        status: true,
        guildId: true,
        formId: true,
        form: { select: { title: true, settings: true } },
        guild: { select: { statusMessages: true } },
        user: { select: { username: true } },
      },
    });
    if (!current || current.status === toStatus) {
      return { changed: false, fromStatus: current?.status ?? null };
    }

    // Resolve the applicant-facing message for this transition: an explicit
    // override wins; otherwise the per-status template (form override -> guild).
    // Only public changes carry a message; hidden/internal changes stay silent.
    const finalMessage =
      eventVisibility === "public"
        ? resolveTransitionMessage(
            applicantMessage,
            (current.form?.settings as Record<string, unknown> | null)?.statusMessages,
            current.guild?.statusMessages,
            toStatus,
          )
        : null;

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
        visibility: eventVisibility,
      },
    });

    // Record the applicant-facing message (visible on the status page).
    if (finalMessage) {
      await tx.submissionEvent.create({
        data: {
          submissionId,
          actorUserId,
          type: "message",
          message: finalMessage,
          visibility: "public",
        },
      });
    }

    // Applicant DM: a resolved message supersedes the generic status-change DM
    // (one meaningful notification), otherwise send the status-change DM as before.
    if (notify) {
      if (finalMessage) {
        await tx.notification.create({
          data: {
            userId: notify.userId,
            type: "message",
            payload: {
              submissionId,
              formTitle: current.form?.title ?? null,
              message: finalMessage,
            } as Prisma.InputJsonValue,
          },
        });
      } else {
        await tx.notification.create({
          data: {
            userId: notify.userId,
            type: notify.type,
            payload: notify.payload as Prisma.InputJsonValue,
          },
        });
      }
    }

    // Activity log: record the transition for the guild's log channel.
    await enqueueGuildLog(tx, current.guildId, {
      action: "status_changed",
      actorName: actorName ?? undefined,
      formTitle: current.form?.title,
      applicantName: current.user?.username ?? "Anonymous",
      fromStatus: current.status,
      toStatus,
      toStatusLabel: toStatusLabel ?? undefined,
      submissionId,
    });

    // Queue any subscribed webhook deliveries (atomic with the transition).
    await enqueueWebhooks(tx, current.guildId, "submission.status_changed", {
      event: "submission.status_changed",
      guildId: current.guildId,
      submissionId,
      formId: current.formId,
      fromStatus: current.status,
      toStatus,
      at: new Date().toISOString(),
    });

    // Realtime: announce the change so the applicant's status page updates live
    // (the realtime service LISTENs on this channel). Fires on commit.
    await tx.$executeRaw`SELECT pg_notify('submission_change', ${submissionId})`;

    return { changed: true, fromStatus: current.status };
  });
}

/**
 * Best-effort realtime ping for a submission change that didn't go through
 * {@link changeSubmissionStatus} (e.g. a public message or a withdrawal). Never
 * throws — a missing/failed notification must not fail the request.
 */
export async function notifySubmissionChange(submissionId: string): Promise<void> {
  try {
    await prisma.$executeRaw`SELECT pg_notify('submission_change', ${submissionId})`;
  } catch (err) {
    console.error("[notify] pg_notify failed:", (err as Error).message);
  }
}
