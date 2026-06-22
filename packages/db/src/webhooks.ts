import { Prisma, prisma } from "./index";

/** Either the singleton client or a transaction client. */
type Db = typeof prisma | Prisma.TransactionClient;

/**
 * Queue webhook deliveries for every active webhook in `guildId` that subscribes
 * to `event`: one WebhookDelivery row per webhook, picked up by the bot's outbox
 * poller. Pass a transaction client (`tx`) to make enqueuing atomic with the
 * change that triggered it. No-op when no endpoint subscribes.
 *
 * Event name strings mirror `WEBHOOK_EVENTS` in `@msk-forms/shared` (not imported
 * here to keep `@msk-forms/db` free of the shared dependency).
 */
export async function enqueueWebhooks(
  db: Db,
  guildId: string,
  event: string,
  payload: Record<string, unknown>,
): Promise<void> {
  const hooks = await db.webhook.findMany({
    where: { guildId, active: true, events: { has: event } },
    select: { id: true },
  });
  if (hooks.length === 0) return;

  await db.webhookDelivery.createMany({
    data: hooks.map((h) => ({
      webhookId: h.id,
      event,
      payload: payload as Prisma.InputJsonValue,
    })),
  });
}
