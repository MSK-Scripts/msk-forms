import { z } from "zod";

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
