import type { ConditionRule, FormField } from "./form-spec";

/** Answers keyed by field id (values are scalars, arrays, or objects). */
export type AnswerMap = Record<string, unknown>;

/** True when an answer counts as "no meaningful value" (shared client+server). */
export function isBlankAnswer(value: unknown): boolean {
  if (value === undefined || value === null || value === "") return true;
  if (Array.isArray(value)) return value.length === 0;
  if (value === false) return true; // unchecked consent/age_check
  if (typeof value === "object") return Object.keys(value).length === 0;
  return false;
}

/** Evaluate a single rule's `when` clause against the current answers. */
export function evaluateCondition(when: ConditionRule["when"], answers: AnswerMap): boolean {
  const actual = answers[when.field];
  const expected = when.value;

  switch (when.op) {
    case "equals":
      return String(actual) === String(expected);
    case "not_equals":
      return String(actual) !== String(expected);
    case "contains":
      return Array.isArray(actual)
        ? actual.map(String).includes(String(expected))
        : String(actual ?? "").includes(String(expected ?? ""));
    case "greater_than":
      return Number(actual) > Number(expected);
    case "less_than":
      return Number(actual) < Number(expected);
    case "is_empty":
      return isBlankAnswer(actual);
    case "is_not_empty":
      return !isBlankAnswer(actual);
    case "in_list":
      return Array.isArray(expected) ? expected.map(String).includes(String(actual)) : false;
    default:
      return false;
  }
}

/**
 * Whether a field should be shown given the current answers. Default visible;
 * `show` rules make it visible only when at least one matches; a matching `hide`
 * rule then forces it hidden.
 */
export function isFieldVisible(field: FormField, answers: AnswerMap): boolean {
  const rules = field.conditional ?? [];
  const showRules = rules.filter((r) => r.action === "show");
  const hideRules = rules.filter((r) => r.action === "hide");

  let visible = showRules.length === 0 || showRules.some((r) => evaluateCondition(r.when, answers));
  if (visible && hideRules.some((r) => evaluateCondition(r.when, answers))) visible = false;
  return visible;
}

/**
 * Whether a field is required given the current answers — its base `required`
 * flag, plus any `require` rule whose condition currently matches.
 */
export function isFieldRequired(field: FormField, answers: AnswerMap): boolean {
  if (field.validation.required) return true;
  return (field.conditional ?? []).some(
    (r) => r.action === "require" && evaluateCondition(r.when, answers),
  );
}
