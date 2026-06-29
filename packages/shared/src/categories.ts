import { z } from "zod";

/** Max categories a guild can define. */
export const MAX_CATEGORIES = 40;

/**
 * One category row in the management form. `id` is present for existing rows
 * (so the server can update in place and keep `Form.categoryId` references) and
 * absent for newly added ones. `order` is assigned server-side by position.
 */
export const categoryInputSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(60),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Use a hex color like #4ea426.")
    .nullable()
    .optional(),
  order: z.number().int().min(0).max(1000).default(0),
});

export const categoriesSchema = z.array(categoryInputSchema).max(MAX_CATEGORIES);

export type CategoryInput = z.infer<typeof categoryInputSchema>;
