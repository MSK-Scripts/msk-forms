/**
 * The custom messages of the dashboard's zod schemas, by key. Schemas use these
 * constants instead of inline text: the API speaks English, and the dashboard
 * routes map a message back to its key to answer in the viewer's language
 * (`validation` in the web app's dictionaries, which must have every key).
 */
export const VALIDATION_MESSAGES = {
  discordId: "Enter a valid Discord ID.",
  discordWebhookUrl: "Enter a valid Discord channel webhook URL.",
  discordUrlInGeneric: "This looks like a Discord webhook URL. Choose the Discord format.",
  url: "Enter a valid URL.",
  domain: "Enter a valid domain like apply.example.com.",
  slug: "Use lowercase letters, numbers and hyphens only.",
  handle: "Use lowercase letters, numbers and hyphens (no leading or trailing hyphen).",
  handleReserved: "That handle is reserved.",
  statusKey: "Use 1–32 lowercase letters, digits or underscores.",
  duplicateKey: "Each key can only be used once.",
  hexColor: "Use a hex color like #00E676.",
  oneEvent: "Select at least one event.",
  oneLogEvent: "Select at least one thing to log.",
} as const;

export type ValidationMessageKey = keyof typeof VALIDATION_MESSAGES;

const BY_MESSAGE = new Map<string, ValidationMessageKey>(
  (Object.entries(VALIDATION_MESSAGES) as [ValidationMessageKey, string][]).map(([k, v]) => [v, k]),
);

/** The key of one of our own validation messages, or undefined for any other text. */
export function validationMessageKey(message: string): ValidationMessageKey | undefined {
  return BY_MESSAGE.get(message);
}
