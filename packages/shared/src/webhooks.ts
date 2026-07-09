import { z } from "zod";

import {
  type AnswerValueLabels,
  formatAnswerValue,
  formSpecSchema,
  isLayoutField,
} from "./form-spec";

/**
 * Outgoing webhook events a guild can subscribe to (concept §20). Keep these
 * literals in sync with the enqueue sites (`@msk-forms/db`): the submit route
 * fires `submission.created`, `changeSubmissionStatus` fires
 * `submission.status_changed`.
 */
export const WEBHOOK_EVENTS = [
  "submission.created",
  "submission.status_changed",
] as const;
export type WebhookEvent = (typeof WEBHOOK_EVENTS)[number];

const webhookEventSchema = z.enum(WEBHOOK_EVENTS);

/**
 * Delivery format for a webhook. `json` is the generic HMAC-signed POST; `discord`
 * targets a Discord channel webhook and receives a formatted embed, so a guild can
 * log submissions into any Discord server (the bot need not be a member there).
 */
export const WEBHOOK_FORMATS = ["json", "discord"] as const;
export type WebhookFormat = (typeof WEBHOOK_FORMATS)[number];
const webhookFormatSchema = z.enum(WEBHOOK_FORMATS);

/**
 * A Discord channel webhook URL, e.g.
 * `https://discord.com/api/webhooks/<id>/<token>` (canary/ptb and an optional
 * `/vN` version segment allowed). Used to validate `discord`-format webhooks.
 */
export const DISCORD_WEBHOOK_URL_RE =
  /^https:\/\/(?:(?:canary|ptb)\.)?discord(?:app)?\.com\/api(?:\/v\d+)?\/webhooks\/\d+\/[A-Za-z0-9_-]+$/;

/** A guild's webhook registration as submitted from the dashboard. */
export const webhookInputSchema = z
  .object({
    url: z.string().url("Enter a valid URL.").max(2000),
    events: z.array(webhookEventSchema).min(1, "Select at least one event."),
    active: z.boolean().default(true),
    format: webhookFormatSchema.default("json"),
    /** Optional form to scope the webhook to; omit/null = every form. */
    formId: z.string().uuid().nullish(),
  })
  .superRefine((val, ctx) => {
    const isDiscordUrl = DISCORD_WEBHOOK_URL_RE.test(val.url);
    if (val.format === "discord" && !isDiscordUrl) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["url"],
        message: "Enter a valid Discord channel webhook URL.",
      });
    }
    // Common mistake: pasting a Discord webhook URL but leaving the generic JSON
    // format — Discord rejects the raw signed body, so nothing gets logged.
    if (val.format === "json" && isDiscordUrl) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["url"],
        message: "This looks like a Discord webhook URL — choose the Discord format.",
      });
    }
  });
export type WebhookInput = z.infer<typeof webhookInputSchema>;

/** Shape of the JSON body POSTed to a subscribed endpoint. */
export interface WebhookEventPayload {
  event: WebhookEvent;
  guildId: string;
  submissionId: string;
  formId: string;
  /** Only present for `submission.status_changed`. */
  fromStatus?: string | null;
  toStatus?: string;
  /** ISO-8601 timestamp of the event. */
  at: string;
}

/** Integration providers that manage their own webhook subscriptions. */
export const WEBHOOK_SOURCES = ["manual", "zapier", "make", "integration"] as const;
export type WebhookSource = (typeof WEBHOOK_SOURCES)[number];
const webhookSourceSchema = z.enum(WEBHOOK_SOURCES);

/**
 * Body of a REST-Hook subscribe call (`POST /api/v1/hooks`) as sent by Zapier,
 * Make, or any API-key client: the target URL to deliver to, the event to watch,
 * and an optional provider tag so the dashboard can show who manages the hook.
 */
export const webhookSubscribeSchema = z.object({
  targetUrl: z.string().url("Enter a valid URL.").max(2000),
  event: z.enum(WEBHOOK_EVENTS),
  source: webhookSourceSchema.default("integration"),
});
export type WebhookSubscribeInput = z.infer<typeof webhookSubscribeSchema>;

/** A single formatted answer in an enriched webhook payload. */
export interface WebhookAnswer {
  fieldId: string;
  label: string;
  type: string;
  /** Human-readable value (option labels resolved, files shown by name). */
  value: string;
}

/**
 * Rich submission payload delivered to integration endpoints. Unlike the thin
 * {@link WebhookEventPayload} stored in the outbox, this carries the full
 * submission — form metadata, status, score, applicant, and formatted answers —
 * so Zapier/Make users can map fields directly without a follow-up fetch.
 */
export interface SubmissionWebhookPayload {
  event: WebhookEvent;
  guildId: string;
  formId: string;
  formSlug: string;
  formTitle: string;
  submissionId: string;
  status: string;
  score: number | null;
  /** ISO-8601 submission timestamp. */
  submittedAt: string;
  applicant: { discordId: string | null; name: string | null; anonymous: boolean };
  answers: WebhookAnswer[];
  /** Only present for `submission.status_changed`. */
  fromStatus?: string | null;
  toStatus?: string;
  /** ISO-8601 timestamp of the event. */
  at: string;
}

/** Labels used when formatting answer values for a machine payload (no i18n). */
const WEBHOOK_ANSWER_LABELS: AnswerValueLabels = { empty: "", yes: "true", no: "false" };

/**
 * Build the enriched {@link SubmissionWebhookPayload} from already-loaded data.
 * Pure (no I/O) so it can run in the bot's delivery path with the form spec and
 * submission fetched once. Layout fields are skipped; unparsable specs yield an
 * empty `answers` array rather than throwing.
 */
export function buildSubmissionWebhookPayload(input: {
  event: WebhookEvent;
  at: string;
  guildId: string;
  form: { id: string; slug: string; title: string; schema: unknown };
  submission: {
    id: string;
    status: string;
    score: number | null;
    submittedAt: string;
    answers: unknown;
  };
  applicant?: { discordId?: string | null; name?: string | null };
  transition?: { fromStatus?: string | null; toStatus?: string };
}): SubmissionWebhookPayload {
  const parsed = formSpecSchema.safeParse(input.form.schema);
  const answersMap = (input.submission.answers ?? {}) as Record<string, unknown>;

  const answers: WebhookAnswer[] = [];
  if (parsed.success) {
    for (const field of parsed.data.pages.flatMap((p) => p.fields)) {
      if (isLayoutField(field.type)) continue;
      answers.push({
        fieldId: field.id,
        label: field.label ?? field.id,
        type: field.type,
        value: formatAnswerValue(field, answersMap[field.id], WEBHOOK_ANSWER_LABELS),
      });
    }
  }

  const discordId = input.applicant?.discordId ?? null;
  const name = input.applicant?.name ?? null;

  return {
    event: input.event,
    guildId: input.guildId,
    formId: input.form.id,
    formSlug: input.form.slug,
    formTitle: input.form.title,
    submissionId: input.submission.id,
    status: input.submission.status,
    score: input.submission.score,
    submittedAt: input.submission.submittedAt,
    applicant: { discordId, name, anonymous: !discordId && !name },
    answers,
    ...(input.transition
      ? { fromStatus: input.transition.fromStatus ?? null, toStatus: input.transition.toStatus }
      : {}),
    at: input.at,
  };
}

// --- Discord webhook rendering ---------------------------------------------

/** MSK green / a neutral blue, as Discord embed color integers. */
const DISCORD_COLOR_CREATED = 0x5eb131;
const DISCORD_COLOR_UPDATED = 0x3b82f6;
/** Discord embed limits we defensively stay under. */
const DISCORD_MAX_FIELD_VALUE = 1024;
const DISCORD_MAX_TITLE = 256;
const DISCORD_MAX_ANSWER_FIELDS = 18;

function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

/** A minimal Discord embed shape (only the fields we set). */
export interface DiscordWebhookBody {
  embeds: Array<{
    title: string;
    color: number;
    fields: Array<{ name: string; value: string; inline?: boolean }>;
    timestamp: string;
    footer: { text: string };
  }>;
}

/**
 * Render a {@link SubmissionWebhookPayload} as a Discord webhook body (an embed
 * with the applicant, status, score and formatted answers). Pure JSON, so it can
 * be POSTed to any Discord channel webhook URL without discord.js. Values are
 * truncated to stay within Discord's embed limits.
 */
export function buildDiscordWebhookBody(payload: SubmissionWebhookPayload): DiscordWebhookBody {
  const created = payload.event === "submission.created";
  const title = truncate(
    `${created ? "New submission" : "Submission updated"}: ${payload.formTitle || "Form"}`,
    DISCORD_MAX_TITLE,
  );

  const fields: DiscordWebhookBody["embeds"][number]["fields"] = [];

  const applicant = payload.applicant?.anonymous
    ? "Anonymous"
    : payload.applicant?.name || payload.applicant?.discordId || "Unknown";
  fields.push({ name: "Applicant", value: truncate(applicant, DISCORD_MAX_FIELD_VALUE), inline: true });

  const statusText =
    !created && payload.fromStatus
      ? `${payload.fromStatus} → ${payload.toStatus ?? payload.status}`
      : payload.status;
  fields.push({ name: "Status", value: truncate(statusText, DISCORD_MAX_FIELD_VALUE), inline: true });

  if (payload.score !== null && payload.score !== undefined) {
    fields.push({ name: "Score", value: String(payload.score), inline: true });
  }

  for (const answer of payload.answers.slice(0, DISCORD_MAX_ANSWER_FIELDS)) {
    const value = answer.value.trim() ? truncate(answer.value, DISCORD_MAX_FIELD_VALUE) : "—";
    fields.push({ name: truncate(answer.label || answer.fieldId, DISCORD_MAX_TITLE), value });
  }

  return {
    embeds: [
      {
        title,
        color: created ? DISCORD_COLOR_CREATED : DISCORD_COLOR_UPDATED,
        fields,
        timestamp: payload.at,
        footer: { text: "MSK Forms" },
      },
    ],
  };
}
