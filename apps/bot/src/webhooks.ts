import { createHmac } from "node:crypto";

import { prisma } from "@msk-forms/db";
import {
  buildDiscordWebhookBody,
  buildSubmissionWebhookPayload,
  type SubmissionWebhookPayload,
  type WebhookEvent,
} from "@msk-forms/shared";

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
  webhook: { url: string; secret: string; format: string } | null;
};

/** Exponential-ish backoff (minutes) keyed by the attempt just made. */
function backoffMs(attempts: number): number {
  const minutes = [1, 5, 15, 60, 180, 360];
  return (minutes[Math.min(attempts, minutes.length - 1)] ?? 360) * 60_000;
}

/** The thin payload stored in the outbox at enqueue time. */
type ThinPayload = {
  event?: WebhookEvent;
  guildId?: string;
  submissionId?: string;
  formId?: string;
  fromStatus?: string | null;
  toStatus?: string;
  at?: string;
};

/**
 * Turn the thin outbox payload into the rich {@link buildSubmissionWebhookPayload}
 * body by loading the submission + form once at delivery time. This enriches
 * every event regardless of which path enqueued it (submit, web review, bulk, bot
 * accept, automations) and always reflects the current state. Falls back to the
 * stored thin payload when the submission has since been deleted.
 */
async function hydratePayload(stored: unknown): Promise<unknown> {
  const thin = (stored ?? {}) as ThinPayload;
  if (!thin.event || !thin.submissionId) return stored ?? {};

  const sub = await prisma.submission.findUnique({
    where: { id: thin.submissionId },
    select: {
      id: true,
      status: true,
      score: true,
      submittedAt: true,
      answers: true,
      guildId: true,
      form: { select: { id: true, slug: true, title: true, schema: true } },
      user: { select: { discordId: true, username: true } },
    },
  });
  if (!sub) return stored ?? {};

  return buildSubmissionWebhookPayload({
    event: thin.event,
    at: thin.at ?? new Date().toISOString(),
    guildId: sub.guildId,
    form: sub.form,
    submission: {
      id: sub.id,
      status: sub.status,
      score: sub.score,
      submittedAt: sub.submittedAt.toISOString(),
      answers: sub.answers,
    },
    applicant: { discordId: sub.user?.discordId ?? null, name: sub.user?.username ?? null },
    transition:
      thin.event === "submission.status_changed"
        ? { fromStatus: thin.fromStatus, toStatus: thin.toStatus }
        : undefined,
  });
}

/**
 * POST one delivery to its endpoint. Generic (`json`) hooks get the raw JSON body
 * HMAC-signed via `X-MSK-Signature`; `discord` hooks get a formatted embed body
 * (no signature — Discord doesn't verify one). On a 2xx the row is marked
 * `success`; otherwise it's retried with backoff until MAX_ATTEMPTS, then marked
 * `failed` with the last error.
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

  const hydrated = await hydratePayload(row.payload);
  const isDiscord = row.webhook.format === "discord";
  const body = isDiscord
    ? JSON.stringify(buildDiscordWebhookBody(hydrated as SubmissionWebhookPayload))
    : JSON.stringify(hydrated);
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "User-Agent": "MSK-Forms-Webhook/1",
  };
  if (!isDiscord) {
    const signature = createHmac("sha256", row.webhook.secret).update(body).digest("hex");
    headers["X-MSK-Event"] = row.event;
    headers["X-MSK-Signature"] = `sha256=${signature}`;
  }
  const attempts = row.attempts + 1;

  let ok = false;
  let error: string | null = null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(row.webhook.url, {
      method: "POST",
      headers,
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
        webhook: { select: { url: true, secret: true, format: true } },
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
