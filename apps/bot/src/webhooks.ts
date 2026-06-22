import { createHmac } from "node:crypto";

import { prisma } from "@msk-forms/db";

/** How many pending deliveries to drain per tick. */
const BATCH = 25;
/** Give up (mark failed) after this many attempts. */
const MAX_ATTEMPTS = 6;
/** Per-request timeout. */
const TIMEOUT_MS = 10_000;

/** Guards against overlapping ticks if a batch outlives the poll interval. */
let running = false;

type DeliveryRow = {
  id: string;
  event: string;
  payload: unknown;
  attempts: number;
  webhook: { url: string; secret: string } | null;
};

/** Exponential-ish backoff (minutes) keyed by the attempt just made. */
function backoffMs(attempts: number): number {
  const minutes = [1, 5, 15, 60, 180, 360];
  return (minutes[Math.min(attempts, minutes.length - 1)] ?? 360) * 60_000;
}

/**
 * POST one delivery to its endpoint, HMAC-signing the raw JSON body. On a 2xx the
 * row is marked `success`; otherwise it's retried with backoff until MAX_ATTEMPTS,
 * then marked `failed` with the last error.
 */
async function deliverOne(row: DeliveryRow): Promise<void> {
  if (!row.webhook) {
    // Endpoint deleted between enqueue and delivery — nothing to send.
    await prisma.webhookDelivery.update({
      where: { id: row.id },
      data: { status: "failed", lastError: "Webhook no longer exists." },
    });
    return;
  }

  const body = JSON.stringify(row.payload ?? {});
  const signature = createHmac("sha256", row.webhook.secret).update(body).digest("hex");
  const attempts = row.attempts + 1;

  let ok = false;
  let error: string | null = null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(row.webhook.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "MSK-Forms-Webhook/1",
        "X-MSK-Event": row.event,
        "X-MSK-Signature": `sha256=${signature}`,
      },
      body,
      signal: controller.signal,
    });
    ok = res.ok;
    if (!ok) error = `HTTP ${res.status}`;
  } catch (err) {
    error = (err as Error).message;
  } finally {
    clearTimeout(timer);
  }

  if (ok) {
    await prisma.webhookDelivery.update({
      where: { id: row.id },
      data: { status: "success", attempts, deliveredAt: new Date(), lastError: null },
    });
    return;
  }

  const giveUp = attempts >= MAX_ATTEMPTS;
  await prisma.webhookDelivery.update({
    where: { id: row.id },
    data: {
      status: giveUp ? "failed" : "pending",
      attempts,
      lastError: error,
      nextAttemptAt: new Date(Date.now() + backoffMs(attempts)),
    },
  });
}

/** Drain the webhook outbox: deliver every due `pending` row (best-effort). */
export async function deliverPendingWebhooks(): Promise<void> {
  if (running) return;
  running = true;
  try {
    const pending = (await prisma.webhookDelivery.findMany({
      where: { status: "pending", nextAttemptAt: { lte: new Date() } },
      orderBy: { createdAt: "asc" },
      take: BATCH,
      select: {
        id: true,
        event: true,
        payload: true,
        attempts: true,
        webhook: { select: { url: true, secret: true } },
      },
    })) as DeliveryRow[];

    for (const row of pending) {
      try {
        await deliverOne(row);
      } catch (err) {
        console.error(`[bot] webhook delivery ${row.id} failed:`, (err as Error).message);
      }
    }
  } catch (err) {
    console.error("[bot] webhook poll error:", (err as Error).message);
  } finally {
    running = false;
  }
}
