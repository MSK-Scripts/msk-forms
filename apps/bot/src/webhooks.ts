import { createHmac } from "node:crypto";

import { prisma } from "@msk-forms/db";
import {
  auditActionFromEvent,
  buildDiscordWebhookBody,
  buildSubmissionWebhookPayload,
  parseBotConfig,
  type LogNotification,
  type SubmissionWebhookPayload,
  type WebhookEvent,
} from "@msk-forms/shared";

import { config } from "./config.js";
import { guildStrings } from "./guild-i18n.js";
import { buildLogEmbed } from "./log-embed.js";
import { dashboardSubmissionUrl } from "./urls.js";

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
  webhookId: string;
  webhook: { id: string; guildId: string; url: string; secret: string; format: string } | null;
};

/**
 * Discord answers these for a webhook that was deleted or whose token was
 * regenerated. Retrying cannot help, so the hook is switched off and the
 * dashboard shows why.
 */
const DISCORD_WEBHOOK_GONE = new Set([401, 404]);

/** What happened to one delivery, as far as the poll loop needs to know. */
type DeliveryResult = { rateLimitedUntil?: number; disabled?: boolean };

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
 * Render an audit-log entry (`log.<action>`) as a Discord webhook body, in the
 * guild's configured bot language. Same embed as the bot's log channel.
 */
async function buildAuditBody(
  guildId: string,
  payload: unknown,
): Promise<Record<string, unknown> | null> {
  const entry = (payload ?? {}) as Partial<LogNotification>;
  const guild = await prisma.guild.findUnique({
    where: { id: guildId },
    select: { botConfig: true },
  });
  const strings = guildStrings(parseBotConfig(guild?.botConfig).locale);
  const embed = buildLogEmbed(entry, strings, {
    dashboardUrl: entry.submissionId
      ? dashboardSubmissionUrl(config.apiBaseUrl, guildId, entry.submissionId)
      : null,
  });
  // Mentions inside embeds never ping; say so explicitly anyway, so a future
  // content field can't start pinging people from a log channel.
  return embed ? { embeds: [embed], allowed_mentions: { parse: [] } } : null;
}

/** How long Discord asks us to wait, from the body or the Retry-After header. */
async function retryAfterMs(res: Response): Promise<number> {
  const body = (await res.json().catch(() => null)) as { retry_after?: unknown } | null;
  const fromBody = typeof body?.retry_after === "number" ? body.retry_after : null;
  const fromHeader = Number(res.headers.get("retry-after"));
  const seconds = fromBody ?? (Number.isFinite(fromHeader) && fromHeader > 0 ? fromHeader : 5);
  return Math.min(Math.max(seconds, 0.5), 600) * 1000;
}

/**
 * POST one delivery to its endpoint. Generic (`json`) hooks get the raw JSON body
 * HMAC-signed via `X-MSK-Signature`; `discord` hooks get a formatted embed body
 * (no signature — Discord doesn't verify one). On a 2xx the row is marked
 * `success`; otherwise it's retried with backoff until MAX_ATTEMPTS, then marked
 * `failed` with the last error.
 */
async function deliverOne(row: DeliveryRow): Promise<DeliveryResult> {
  if (!row.webhook) {
    // Endpoint deleted between enqueue and delivery — nothing to send.
    await prisma.webhookDelivery.update({
      where: { id: row.id },
      data: { status: "failed", lastError: "Webhook no longer exists." },
    });
    return {};
  }

  const isDiscord = row.webhook.format === "discord";
  const isAudit = auditActionFromEvent(row.event) !== null;

  let body: string;
  if (isAudit) {
    const auditBody = await buildAuditBody(row.webhook.guildId, row.payload);
    if (!auditBody) {
      await prisma.webhookDelivery.update({
        where: { id: row.id },
        data: { status: "failed", lastError: "Unknown log entry." },
      });
      return {};
    }
    body = JSON.stringify(auditBody);
  } else {
    const hydrated = await hydratePayload(row.payload);
    body = isDiscord
      ? JSON.stringify(buildDiscordWebhookBody(hydrated as SubmissionWebhookPayload))
      : JSON.stringify(hydrated);
  }

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

  let res: Response | null = null;
  let error: string | null = null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    res = await fetch(row.webhook.url, {
      method: "POST",
      headers,
      body,
      signal: controller.signal,
    });
    if (!res.ok) error = `HTTP ${res.status}`;
  } catch (err) {
    error = (err as Error).message;
  } finally {
    clearTimeout(timer);
  }

  if (res?.ok) {
    await prisma.webhookDelivery.update({
      where: { id: row.id },
      data: { status: "success", attempts, deliveredAt: new Date(), lastError: null },
    });
    return {};
  }

  // Rate limited: not the endpoint's fault and not a failed attempt. Wait as
  // long as asked without spending one of the row's attempts, so a burst of
  // log entries (a bulk change of 200 submissions) arrives late instead of
  // ending up marked failed.
  if (res?.status === 429) {
    const until = Date.now() + (await retryAfterMs(res));
    await prisma.webhookDelivery.update({
      where: { id: row.id },
      data: { lastError: "Rate limited by the endpoint.", nextAttemptAt: new Date(until) },
    });
    return { rateLimitedUntil: until };
  }

  if (isDiscord && res && DISCORD_WEBHOOK_GONE.has(res.status)) {
    const reason = "Discord no longer accepts this webhook (deleted or reset in Discord).";
    // Fail everything still queued for it too, so the poller doesn't knock on
    // the same closed door once per queued entry.
    await prisma.$transaction([
      prisma.webhookDelivery.update({
        where: { id: row.id },
        data: { status: "failed", attempts, lastError: reason },
      }),
      prisma.webhookDelivery.updateMany({
        where: { webhookId: row.webhook.id, status: "pending" },
        data: { status: "failed", lastError: reason },
      }),
      prisma.webhook.update({ where: { id: row.webhook.id }, data: { active: false } }),
    ]);
    console.warn(`[bot] webhook ${row.webhook.id} rejected by Discord (${res.status}), disabled it.`);
    return { disabled: true };
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
  return {};
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
        webhookId: true,
        webhook: { select: { id: true, guildId: true, url: true, secret: true, format: true } },
      },
    })) as DeliveryRow[];

    // Once an endpoint rate-limits us, leave the rest of its rows for a later
    // tick instead of hammering it (which also keeps their order intact).
    const blocked = new Map<string, number>();
    for (const row of pending) {
      const until = blocked.get(row.webhookId);
      if (until && until > Date.now()) continue;
      try {
        const result = await deliverOne(row);
        if (result.rateLimitedUntil) blocked.set(row.webhookId, result.rateLimitedUntil);
        if (result.disabled) blocked.set(row.webhookId, Number.POSITIVE_INFINITY);
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
