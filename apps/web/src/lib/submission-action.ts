import { z } from "zod";

/**
 * A reviewer action against a submission. One of:
 *  - `status`  — move the submission to another status (creates a public
 *                status_change event + updates Submission.status)
 *  - `note`    — add an internal note (visible only to the team)
 *  - `message` — send a message to the applicant (visible on their status page)
 */
export const submissionActionSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("status"), status: z.string().min(1).max(64) }),
  z.object({ kind: z.literal("note"), message: z.string().min(1).max(4000) }),
  z.object({ kind: z.literal("message"), message: z.string().min(1).max(4000) }),
]);

export type SubmissionAction = z.infer<typeof submissionActionSchema>;
