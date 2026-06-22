/**
 * Pure authorization decisions (no DB, no `server-only`) so they're unit-testable
 * in isolation. lib/guild.ts composes these with the Prisma queries that load a
 * member's role and per-form grants.
 */

/** Roles allowed to create/edit/manage a guild's forms and settings. */
export const MANAGER_ROLES = ["owner", "admin"] as const;

/** Roles that may review every form (guild-wide reviewers). */
export const REVIEWER_ROLES = ["owner", "admin", "reviewer"] as const;

/** Which of a guild's forms a user may review. */
export interface ReviewScope {
  all: boolean;
  formIds: string[];
}

/** True if the role can manage the guild (owner/admin). */
export function isManagerRole(role: string | null): boolean {
  return role !== null && (MANAGER_ROLES as readonly string[]).includes(role);
}

/** True if the role reviews every form (owner/admin/reviewer). */
export function isGlobalReviewerRole(role: string | null): boolean {
  return role !== null && (REVIEWER_ROLES as readonly string[]).includes(role);
}

/**
 * Resolve the review scope from a member's role and their per-form grants:
 * a guild-wide reviewer (owner/admin/reviewer) reviews everything; otherwise
 * only the granted forms; a non-member or a viewer with no grants reviews nothing.
 */
export function scopeFromRole(role: string | null, grantedFormIds: string[]): ReviewScope {
  if (isGlobalReviewerRole(role)) return { all: true, formIds: [] };
  return { all: false, formIds: role === null ? [] : grantedFormIds };
}

/**
 * Whether a user counts toward the plan member cap: a manager/global reviewer,
 * or anyone with at least one per-form grant. Plain viewers with no grants don't.
 */
export function countsTowardTeam(role: string, hasGrants: boolean): boolean {
  return isGlobalReviewerRole(role) || hasGrants;
}
