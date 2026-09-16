import { Prisma, prisma } from "./index";

/** Either the singleton client or a transaction client. */
type Db = typeof prisma | Prisma.TransactionClient;

/**
 * Queue an activity-log entry for a guild. One call feeds both log sinks:
 *
 *  - a channel-targeted `Notification` row (type `log`, no recipient user) that
 *    the bot posts into the guild's log channel, if one is configured, and
 *  - one `WebhookDelivery` per active audit-log webhook subscribed to
 *    `log.<action>`, delivered by the bot's webhook poller.
 *
 * Pass a transaction client (`tx`) to make enqueuing atomic with the change that
 * triggered it. The entry is stamped with `at` here, so a delivery that is
 * retried or rate-limited still shows when the change actually happened.
 *
 * The payload shape mirrors `LogNotification` in `@msk-forms/shared`, and the
 * `"audit"` kind / `log.` prefix mirror `AUDIT_WEBHOOK_KIND` / `auditEvent`
 * there (not imported, to keep `@msk-forms/db` free of the shared dependency).
 * Rows are harmless when neither sink is configured.
 */
export async function enqueueGuildLog(
  db: Db,
  guildId: string,
  payload: Record<string, unknown>,
): Promise<void> {
  const entry: Record<string, unknown> = {
    ...payload,
    at: typeof payload.at === "string" ? payload.at : new Date().toISOString(),
  };

  await db.notification.create({
    data: {
      type: "log",
      guildId,
      payload: entry as Prisma.InputJsonValue,
    },
  });

  const action = typeof entry.action === "string" ? entry.action : null;
  if (!action) return;
  const event = `log.${action}`;
  const formId = typeof entry.formId === "string" ? entry.formId : null;

  const hooks = await db.webhook.findMany({
    where: {
      guildId,
      kind: "audit",
      active: true,
      events: { has: event },
      // A form-scoped audit hook only receives entries about its own form;
      // guild-level entries (members, settings, …) carry no formId and reach
      // guild-wide hooks only.
      OR: [{ formId: null }, ...(formId ? [{ formId }] : [])],
    },
    select: { id: true },
  });
  if (hooks.length === 0) return;

  await db.webhookDelivery.createMany({
    data: hooks.map((h) => ({
      webhookId: h.id,
      event,
      payload: entry as Prisma.InputJsonValue,
    })),
  });
}

/**
 * Best-effort, non-transactional variant for callers outside a request path
 * (e.g. the bot itself) or after the change has already been committed. Never
 * throws — a failed log entry must not break the action it describes.
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
