import type { FormSpec } from "./form-spec";

/** Answers keyed by field id. */
type Answers = Record<string, unknown>;

/**
 * Score a submission (quiz/scoring, concept §26). Each choice option may carry a
 * `score`; a submission's score is the sum of the scores of the options the
 * applicant selected, across every field. Returns null when no option in the
 * form has a score (scoring isn't used) so non-quiz forms stay scoreless.
 */
export function scoreSubmission(spec: FormSpec, answers: Answers): number | null {
  let scored = false;
  let total = 0;

  for (const page of spec.pages) {
    for (const field of page.fields) {
      const options = field.options;
      if (!options?.some((o) => typeof o.score === "number")) continue;
      scored = true;

      const answer = answers[field.id];
      const selected = Array.isArray(answer)
        ? answer.map(String)
        : answer === undefined || answer === null
          ? []
          : [String(answer)];

      for (const option of options) {
        if (typeof option.score === "number" && selected.includes(option.value)) {
          total += option.score;
        }
      }
    }
  }

  return scored ? total : null;
}
