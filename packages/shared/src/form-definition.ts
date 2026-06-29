import { z } from "zod";

import { formSettingsSchema } from "./form-settings";
import { formSpecSchema } from "./form-spec";

/** Bumped when the export envelope shape changes incompatibly. */
export const FORM_DEFINITION_VERSION = 1;

/**
 * Portable JSON representation of a form *definition* (its structure, not its
 * submissions). Produced by the export endpoint and accepted by the import
 * endpoint to create a new form or replace an existing one. The envelope tag
 * lets the importer reject unrelated JSON, and `version` leaves room for future
 * migrations. `slug` is a suggestion only: import regenerates it on collision
 * (create) or keeps the target's slug (replace).
 */
export const formDefinitionSchema = z.object({
  mskForms: z.object({
    type: z.literal("form-definition"),
    version: z.number().int().positive(),
  }),
  exportedAt: z.string().optional(),
  form: z.object({
    title: z.string().min(1).max(200),
    description: z.string().max(2000).nullish(),
    slug: z
      .string()
      .min(1)
      .max(80)
      .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and hyphens only."),
    status: z.enum(["draft", "live", "closed", "archived"]),
    visibility: z.enum(["public", "authenticated", "password", "role_required"]),
    openAt: z.string().datetime().nullish(),
    closeAt: z.string().datetime().nullish(),
    // Category by name (not id) so it survives a move between guilds. Import
    // resolves it against the target guild and creates it if missing.
    category: z.string().max(60).nullish(),
  }),
  spec: formSpecSchema,
  settings: formSettingsSchema.default({}),
});

export type FormDefinition = z.infer<typeof formDefinitionSchema>;
