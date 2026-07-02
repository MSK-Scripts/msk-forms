import { z } from "zod";

import { evaluateCondition, type AnswerMap } from "./conditions";
import { conditionOperatorSchema } from "./form-spec";

/**
 * Per-form settings stored in `Form.settings` (JSON): a per-form accepted role
 * that overrides the guild-wide `botConfig.acceptedRoleId`, plus "when-then"
 * automation rules (concept §20).
 */
const snowflake = z.string().regex(/^\d{17,20}$/, "Enter a valid Discord ID.");

/** A single condition: `answers[field] <op> value` (same shape as field conditions). */
export const automationConditionSchema = z.object({
  field: z.string().min(1),
  op: conditionOperatorSchema,
  value: z.unknown().optional(),
});
export type AutomationCondition = z.infer<typeof automationConditionSchema>;

/**
 * An automation rule. Triggered when a submission is created: if ALL of `when`
 * match the answers (an empty list always matches), the submission is moved to
 * `setStatus`. V1 supports the set-status action only.
 */
export const automationRuleSchema = z.object({
  when: z.array(automationConditionSchema).max(10).default([]),
  setStatus: z.string().min(1).max(32),
});
export type AutomationRule = z.infer<typeof automationRuleSchema>;

/**
 * One arm of an A/B test (concept §26). Overrides the public form's copy; an
 * applicant is stickily assigned a variant and view/submission counts are
 * tracked per variant to measure conversion.
 */
export const experimentVariantSchema = z.object({
  id: z.string().min(1).max(40),
  name: z.string().min(1).max(80),
  /** Relative traffic share; higher = more visitors. 0 disables the variant. */
  weight: z.number().int().min(0).max(100).default(1),
  /** Optional copy overrides shown for this variant. */
  title: z.string().max(200).optional(),
  description: z.string().max(2000).optional(),
});
export type ExperimentVariant = z.infer<typeof experimentVariantSchema>;

export const experimentSchema = z.object({
  enabled: z.boolean().default(false),
  variants: z.array(experimentVariantSchema).max(6).default([]),
});
export type Experiment = z.infer<typeof experimentSchema>;

export const formSettingsSchema = z.object({
  /** Legacy single accepted role (still read for backward compatibility). */
  acceptedRoleId: snowflake.optional(),
  /** Roles granted on acceptance for THIS form (override the guild default). */
  acceptedRoleIds: z.array(snowflake).max(20).optional(),
  /** Review channel for THIS form (overrides the guild's bot config channel). */
  reviewChannelId: snowflake.optional(),
  /** When-then rules evaluated on submission creation. */
  automations: z.array(automationRuleSchema).max(20).default([]),
  /** Optional A/B test over the public form's copy. */
  experiment: experimentSchema.optional(),
  /**
   * Tease a scheduled (not-yet-open) form on the public hub with a live
   * countdown, and celebrate with confetti when it opens. Off by default keeps
   * the plain "opens at <date>" text.
   */
  showCountdown: z.boolean().optional(),
  /**
   * Limit each signed-in applicant to one active (non-terminal) submission:
   * while their submission is open they can't submit again and are sent to its
   * status page. Once a reviewer sets a terminal status (accepted/rejected/
   * withdrawn or a custom terminal status) they may apply again. Default on;
   * turn off for forms that accept repeated submissions (surveys/feedback).
   * Only enforceable for signed-in applicants (anonymous submits can't be tied
   * to a person). Treat `undefined` as on — see `singleSubmissionEnforced`.
   */
  singleSubmission: z.boolean().default(true),
});

/** Whether the "one active submission per person" rule is on (undefined = on). */
export function singleSubmissionEnforced(s: { singleSubmission?: boolean }): boolean {
  return s.singleSubmission !== false;
}

/** True when an experiment is live (enabled with at least two variants). */
export function experimentActive(exp: Experiment | undefined): boolean {
  return Boolean(exp?.enabled && (exp.variants?.length ?? 0) >= 2);
}

/**
 * Weighted-random variant pick. `rnd` is a number in [0, 1) (caller supplies it
 * so this stays pure/testable). Returns the chosen variant id, or null when no
 * variant has positive weight.
 */
export function pickVariant(variants: ExperimentVariant[], rnd: number): string | null {
  const active = variants.filter((v) => v.weight > 0);
  if (active.length === 0) return null;
  const total = active.reduce((sum, v) => sum + v.weight, 0);
  let r = rnd * total;
  for (const v of active) {
    r -= v.weight;
    if (r < 0) return v.id;
  }
  return active[active.length - 1]!.id;
}

export type FormSettings = z.infer<typeof formSettingsSchema>;

/** Parse a stored Form.settings JSON blob, falling back to empty settings. */
export function parseFormSettings(json: unknown): FormSettings {
  const result = formSettingsSchema.safeParse(json);
  return result.success ? result.data : { automations: [], singleSubmission: true };
}

/**
 * Effective accepted-role ids for a settings/bot-config object: the new
 * `acceptedRoleIds` array when present, otherwise the legacy single
 * `acceptedRoleId`, otherwise empty. Works for both form settings and guild
 * bot config (same field names).
 */
export function acceptedRoleIdsOf(s: {
  acceptedRoleIds?: string[];
  acceptedRoleId?: string;
}): string[] {
  if (s.acceptedRoleIds && s.acceptedRoleIds.length > 0) return s.acceptedRoleIds;
  return s.acceptedRoleId ? [s.acceptedRoleId] : [];
}

/** Split a free-text list of Discord ids (comma / whitespace / newline separated), de-duped. */
export function parseIdList(raw: string): string[] {
  return [...new Set(raw.split(/[\s,]+/).map((s) => s.trim()).filter(Boolean))];
}

/**
 * Evaluate automation rules against a submission's answers. Returns the first
 * matching rule's target status, or null when none match. Conditions within a
 * rule are AND-combined.
 */
export function evaluateAutomations(rules: AutomationRule[], answers: AnswerMap): string | null {
  for (const rule of rules) {
    if (rule.when.every((c) => evaluateCondition(c, answers))) return rule.setStatus;
  }
  return null;
}
