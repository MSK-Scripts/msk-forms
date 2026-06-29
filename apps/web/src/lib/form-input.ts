import { formSettingsSchema, formSpecSchema } from "@msk-forms/shared";
import { z } from "zod";

/**
 * Validation schema for the form builder's save payload (create + update).
 * `spec` is validated against the full FormSpec schema; status/visibility
 * mirror the Prisma enums.
 */
export const formInputSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).nullish(),
  slug: z
    .string()
    .min(1)
    .max(80)
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and hyphens only."),
  status: z.enum(["draft", "live", "closed", "archived"]),
  visibility: z.enum(["public", "authenticated", "password", "role_required"]),
  spec: formSpecSchema,
  settings: formSettingsSchema.optional(),
  openAt: z.string().datetime().nullish(),
  closeAt: z.string().datetime().nullish(),
  categoryId: z.string().uuid().nullish(),
});

export type FormInput = z.infer<typeof formInputSchema>;
