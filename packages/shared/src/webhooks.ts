import { z } from "zod";

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

/** A guild's webhook registration as submitted from the dashboard. */
export const webhookInputSchema = z.object({
  url: z.string().url("Enter a valid URL.").max(2000),
  events: z.array(webhookEventSchema).min(1, "Select at least one event."),
  active: z.boolean().default(true),
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
