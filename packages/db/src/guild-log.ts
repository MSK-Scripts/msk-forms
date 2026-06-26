import { Prisma, prisma } from "./index";

/** Either the singleton client or a transaction client. */
type Db = typeof prisma | Prisma.TransactionClient;

/**
 * Queue a channel-targeted activity-log entry for a guild: one `Notification`
 * row (type `log`, no recipient user) picked up by the bot's outbox poller and
 * posted into the guild's configured log channel. Pass a transaction client
 * (`tx`) to make enqueuing atomic with the change that triggered it.
 *
 * The payload shape mirrors `LogNotification` in `@msk-forms/shared` (not
 * imported here to keep `@msk-forms/db` free of the shared dependency). Rows are
 * harmless when no log channel is configured — the bot simply drops them.
 */
export async function enqueueGuildLog(
  db: Db,
  guildId: string,
  payload: Record<string, unknown>,
): Promise<void> {
  await db.notification.create({
    data: {
      type: "log",
      guildId,
      payload: payload as Prisma.InputJsonValue,
    },
  });
}

/**
 * Best-effort, non-transactional variant for callers outside a request path
 * (e.g. the bot itself). Never throws — a failed log entry must not break the
 * action it describes.
 */
export async function logGuildActivitySafe(
  guildId: string,
  payload: Record<string, unknown>,
): Promise<void> {
  try {
    await enqueueGuildLog(prisma, guildId, payload);
  } catch (err) {
    console.error("[guild-log] failed to enqueue log entry:", (err as Error).message);
  }
}
