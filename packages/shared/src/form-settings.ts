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

export const formSettingsSchema = z.object({
  /** Legacy single accepted role (still read for backward compatibility). */
  acceptedRoleId: snowflake.optional(),
  /** Roles granted on acceptance for THIS form (override the guild default). */
  acceptedRoleIds: z.array(snowflake).max(20).optional(),
  /** Review channel for THIS form (overrides the guild's bot config channel). */
  reviewChannelId: snowflake.optional(),
  /** When-then rules evaluated on submission creation. */
  automations: z.array(automationRuleSchema).max(20).default([]),
});

export type FormSettings = z.infer<typeof formSettingsSchema>;

/** Parse a stored Form.settings JSON blob, falling back to empty settings. */
export function parseFormSettings(json: unknown): FormSettings {
  const result = formSettingsSchema.safeParse(json);
  return result.success ? result.data : { automations: [] };
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
