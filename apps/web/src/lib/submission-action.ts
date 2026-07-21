import { z } from "zod";

/**
 * A reviewer action against a submission. One of:
 *  - `status`  — move the submission to another status (updates
 *                Submission.status; records a status_change event and DMs the
 *                applicant unless `hidden` keeps the change internal)
 *  - `note`    — add an internal note (visible only to the team)
 *  - `message` — send a message to the applicant (visible on their status page)
 */
export const submissionActionSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("status"),
    status: z.string().min(1).max(64),
    /** Keep the change internal: no applicant DM, hidden from their status page. */
    hidden: z.boolean().optional(),
    /**
     * Applicant message override for this change. Omit to auto-use the per-status
     * template (form override -> guild); an empty string opts out of any message.
     */
    message: z.string().max(2000).optional(),
  }),
  z.object({ kind: z.literal("note"), message: z.string().min(1).max(4000) }),
  z.object({ kind: z.literal("message"), message: z.string().min(1).max(4000) }),
]);

export type SubmissionAction = z.infer<typeof submissionActionSchema>;
