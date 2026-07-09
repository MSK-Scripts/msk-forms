import type { ConditionRule, FormField, FormPage } from "./form-spec";

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

/**
 * Field-aware "is this required answer missing?" check (shared client+server).
 * Most types defer to `isBlankAnswer`, but two need special handling:
 * - `yes_no`: an explicit "No" is `false`, which is a valid answer — unlike
 *   consent/age_check where an unchecked box (`false`) means no agreement.
 * - `matrix`: every row must have a picked column.
 */
export function isAnswerMissing(field: FormField, value: unknown): boolean {
  if (field.type === "yes_no") return value !== true && value !== false;
  if (field.type === "matrix") {
    const rows = field.rows ?? [];
    return (
      rows.length === 0 ||
      rows.some((row) => isBlankAnswer((value as Record<string, unknown>)?.[row.id]))
    );
  }
  return isBlankAnswer(value);
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

/**
 * The page id a `skip_to` rule on this page jumps to given the current answers,
 * or null. The first matching rule wins.
 */
export function resolvePageSkip(page: FormPage, answers: AnswerMap): string | null {
  for (const field of page.fields) {
    for (const rule of field.conditional ?? []) {
      if (rule.action === "skip_to" && rule.target && evaluateCondition(rule.when, answers)) {
        return rule.target;
      }
    }
  }
  return null;
}

/**
 * The ordered list of page indices the user actually traverses for the current
 * answers, starting at page 0 and following `skip_to` jumps. A cycle guard stops
 * the walk if a page is revisited. Pages not on this path are never shown or
 * validated, so an explicit skip removes them from the flow entirely.
 */
export function computePagePath(pages: FormPage[], answers: AnswerMap): number[] {
  const path: number[] = [];
  const seen = new Set<number>();
  let i = 0;
  while (i >= 0 && i < pages.length && !seen.has(i)) {
    seen.add(i);
    path.push(i);
    const target = resolvePageSkip(pages[i]!, answers);
    if (target) {
      const idx = pages.findIndex((p) => p.id === target);
      i = idx >= 0 ? idx : i + 1;
    } else {
      i += 1;
    }
  }
  return path;
}
