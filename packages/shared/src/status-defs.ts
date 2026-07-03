import { z } from "zod";

import { DEFAULT_STATUSES } from "./constants";

/**
 * True when a status is terminal — an "ending" state that closes the review
 * (built-in accepted/rejected/withdrawn, or any custom def flagged terminal).
 * A guild's custom def sharing a built-in key overrides the built-in flag.
 */
export function isTerminalStatus(
  key: string,
  defs: { key: string; isTerminal?: boolean }[],
): boolean {
  const custom = defs.find((d) => d.key === key);
  if (custom) return custom.isTerminal === true;
  return DEFAULT_STATUSES.find((s) => s.key === key)?.terminal ?? false;
}

/**
 * Guild-defined custom statuses (stored as FormStatusDef rows with formId null).
 * They extend or override the built-in default pipeline (see DEFAULT_STATUSES):
 * a def sharing a default key overrides its label/color; new keys are appended.
 */
export const statusDefInputSchema = z.object({
  // Stable machine key — lowercase letters, digits, underscores.
  key: z
    .string()
    .regex(/^[a-z0-9_]{1,32}$/, "Use 1–32 lowercase letters, digits or underscores."),
  label: z.string().min(1).max(60),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Use a hex color like #00E676."),
  isTerminal: z.boolean().default(false),
  visibleToApplicant: z.boolean().default(true),
});
export type StatusDefInput = z.infer<typeof statusDefInputSchema>;

/** The full set of a guild's custom statuses (unique keys, capped). */
export const statusDefsSchema = z
  .array(statusDefInputSchema)
  .max(40)
  .superRefine((defs, ctx) => {
    const seen = new Set<string>();
    defs.forEach((d, i) => {
      if (seen.has(d.key)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: [i, "key"], message: "Duplicate key." });
      }
      seen.add(d.key);
    });
  });
