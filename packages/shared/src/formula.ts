import type { FormField } from "./form-spec";

// Matches a `{fieldId}` placeholder. The inner length is bounded so the regex
// stays linear (no polynomial backtracking on adversarial input); field ids are
// short well under this cap.
const REFERENCE_RE = /\{([^}]{1,128})\}/g;

/**
 * Calculated fields (concept §26, Phase 3). A `calculated` field carries a
 * `formula` string that references other fields via `{fieldId}` placeholders and
 * combines them with `+ - * / ( )` and numeric literals, e.g. `{price} * {qty}`.
 * The value is computed server-side on submit (authoritative) and previewed live
 * read-only in the renderer. Evaluation is a small recursive-descent parser — no
 * `eval`/`Function`, so a crafted formula can't execute code.
 */

/** Field ids referenced by a formula via `{id}` placeholders (de-duplicated). */
export function referencedFieldIds(formula: string): string[] {
  const ids = new Set<string>();
  for (const m of formula.matchAll(REFERENCE_RE)) {
    const id = m[1]?.trim();
    if (id) ids.add(id);
  }
  return [...ids];
}

/**
 * Numeric value a referenced field contributes to a formula: number/rating
 * fields use their value, single-choice fields their selected option's score,
 * multi-select the sum of selected scores, booleans 1/0, anything blank/unknown
 * 0 (so a partially-filled form still computes).
 */
function referenceValue(field: FormField | undefined, raw: unknown): number {
  if (field === undefined || raw === undefined || raw === null || raw === "") return 0;

  switch (field.type) {
    case "single_choice":
    case "dropdown":
      return field.options?.find((o) => o.value === raw)?.score ?? 0;
    case "multi_choice":
    case "multi_select":
      return (Array.isArray(raw) ? raw : []).reduce(
        (sum: number, v) => sum + (field.options?.find((o) => o.value === v)?.score ?? 0),
        0,
      );
    case "yes_no":
    case "consent":
    case "age_check":
      return raw === true ? 1 : 0;
    default: {
      const n = Number(raw);
      return Number.isFinite(n) ? n : 0;
    }
  }
}

/**
 * Evaluate a calculated-field formula against the current answers. Returns the
 * numeric result (rounded to 6 dp), or null when the formula is empty, fails to
 * parse, or yields a non-finite value (e.g. divide by zero).
 */
export function evaluateFormula(
  formula: string | undefined,
  fieldsById: Map<string, FormField>,
  answers: Record<string, unknown>,
): number | null {
  if (!formula || !formula.trim()) return null;

  // Replace each {id} with its numeric value, parenthesised so a negative value
  // composes correctly (e.g. `1 - {x}` with x = -2 → `1 - (-2)`).
  const substituted = formula.replace(REFERENCE_RE, (_match, id: string) => {
    const key = id.trim();
    return `(${referenceValue(fieldsById.get(key), answers[key])})`;
  });

  try {
    const result = parse(substituted);
    return Number.isFinite(result) ? roundTo(result, 6) : null;
  } catch {
    return null;
  }
}

function roundTo(n: number, dp: number): number {
  const f = 10 ** dp;
  return Math.round(n * f) / f;
}

/** Tokenize into numbers and the operators `+ - * / ( )`; rejects anything else. */
function tokenize(input: string): string[] {
  const tokens: string[] = [];
  let i = 0;
  while (i < input.length) {
    const c = input[i]!;
    if (c === " " || c === "\t" || c === "\n") {
      i += 1;
      continue;
    }
    if ("+-*/()".includes(c)) {
      tokens.push(c);
      i += 1;
      continue;
    }
    if (/[0-9.]/.test(c)) {
      let num = "";
      while (i < input.length && /[0-9.]/.test(input[i]!)) {
        num += input[i]!;
        i += 1;
      }
      tokens.push(num);
      continue;
    }
    throw new Error(`Unexpected character: ${c}`);
  }
  return tokens;
}

/** Recursive-descent arithmetic with the usual precedence and unary +/-. */
function parse(input: string): number {
  const tokens = tokenize(input);
  let pos = 0;
  const peek = () => tokens[pos];
  const next = () => tokens[pos++];

  function expr(): number {
    let value = term();
    while (peek() === "+" || peek() === "-") {
      const op = next();
      const rhs = term();
      value = op === "+" ? value + rhs : value - rhs;
    }
    return value;
  }
  function term(): number {
    let value = factor();
    while (peek() === "*" || peek() === "/") {
      const op = next();
      const rhs = factor();
      value = op === "*" ? value * rhs : value / rhs;
    }
    return value;
  }
  function factor(): number {
    const t = peek();
    if (t === "+") {
      next();
      return factor();
    }
    if (t === "-") {
      next();
      return -factor();
    }
    if (t === "(") {
      next();
      const value = expr();
      if (next() !== ")") throw new Error("Expected )");
      return value;
    }
    if (t === undefined) throw new Error("Unexpected end of formula");
    const n = Number(next());
    if (!Number.isFinite(n)) throw new Error("Invalid number");
    return n;
  }

  const result = expr();
  if (pos !== tokens.length) throw new Error("Trailing tokens");
  return result;
}
