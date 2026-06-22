import "server-only";

import { prisma } from "@msk-forms/db";
import { notFound } from "next/navigation";

import {
  isGlobalReviewerRole,
  isManagerRole,
  REVIEWER_ROLES,
  scopeFromRole,
  type ReviewScope as PureReviewScope,
} from "./access";

// Re-export the pure constants/types so existing importers (`@/lib/guild`) keep working.
export { MANAGER_ROLES, REVIEWER_ROLES } from "./access";

/** The user's role in a guild, or null if they aren't a member. */
export async function getGuildRole(
  guildId: string,
  userId: string,
): Promise<string | null> {
  const membership = await prisma.guildMember.findUnique({
    where: { guildId_userId: { guildId, userId } },
    select: { role: true },
  });
  return membership?.role ?? null;
}

/** A user's review scope in a guild (re-exported from the pure access module). */
export type ReviewScope = PureReviewScope;

/** True if the user may manage (create/edit) the guild's forms. */
export async function canManageForms(guildId: string, userId: string): Promise<boolean> {
  return isManagerRole(await getGuildRole(guildId, userId));
}

/**
 * Which of a guild's forms a user may review. Guild-wide reviewers (owner/admin/
 * reviewer) get `all`; others get their per-form grants; a non-member or a viewer
 * with no grants gets nothing. Decision logic lives in `scopeFromRole`.
 */
export async function getReviewScope(guildId: string, userId: string): Promise<ReviewScope> {
  const role = await getGuildRole(guildId, userId);
  // Only viewers need their per-form grants loaded.
  const grants =
    role === null || isGlobalReviewerRole(role)
      ? []
      : (
          await prisma.formReviewer.findMany({
            where: { userId, form: { guildId } },
            select: { formId: true },
          })
        ).map((g) => g.formId);
  return scopeFromRole(role, grants);
}

/** True if the user may review at least one of the guild's forms. */
export async function canReviewSubmissions(guildId: string, userId: string): Promise<boolean> {
  const scope = await getReviewScope(guildId, userId);
  return scope.all || scope.formIds.length > 0;
}

/** True if the user may review this specific form's submissions. */
export async function canReviewForm(
  guildId: string,
  userId: string,
  formId: string,
): Promise<boolean> {
  const scope = await getReviewScope(guildId, userId);
  return scope.all || scope.formIds.includes(formId);
}

/**
 * Count a guild's "team" against the plan member limit: everyone who is a
 * manager/guild-wide reviewer, plus any member granted a per-form reviewer role.
 * Plain viewers with no grants don't count.
 */
export async function countTeamMembers(guildId: string): Promise<number> {
  const [roleMembers, perFormUserIds] = await Promise.all([
    prisma.guildMember.findMany({
      where: { guildId, role: { in: [...REVIEWER_ROLES] } },
      select: { userId: true },
    }),
    prisma.formReviewer.findMany({
      where: { form: { guildId } },
      select: { userId: true },
      distinct: ["userId"],
    }),
  ]);
  const ids = new Set(roleMembers.map((m) => m.userId));
  perFormUserIds.forEach((g) => ids.add(g.userId));
  return ids.size;
}

/** Guilds the user is a member of, with counts for the switcher cards. */
export async function getUserGuilds(userId: string) {
  const memberships = await prisma.guildMember.findMany({
    where: { userId },
    orderBy: { guild: { name: "asc" } },
    select: {
      role: true,
      guild: {
        select: {
          id: true,
          name: true,
          icon: true,
          _count: { select: { forms: true, submissions: true } },
        },
      },
    },
  });
  return memberships.map((m) => ({ ...m.guild, role: m.role }));
}

/**
 * Load a guild only if the user is a member, otherwise 404. Returns the guild
 * plus the user's role (for permission gating in the UI). This is the
 * authorization gate for every /dashboard/[guildId] route.
 */
export async function requireGuildMembership(guildId: string, userId: string) {
  const membership = await prisma.guildMember.findUnique({
    where: { guildId_userId: { guildId, userId } },
    select: {
      role: true,
      guild: { select: { id: true, name: true, icon: true } },
    },
  });
  if (!membership) notFound();
  return { ...membership.guild, role: membership.role };
}

/** Forms for a guild, with submission counts, for the "Manage Forms" tab. */
export async function getGuildForms(guildId: string) {
  return prisma.form.findMany({
    where: { guildId },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      slug: true,
      title: true,
      status: true,
      visibility: true,
      updatedAt: true,
      _count: { select: { submissions: true } },
    },
  });
}

/**
 * Submissions across a guild's forms, scoped to what the viewer may review.
 * Pass a {@link ReviewScope}: `all` returns everything; otherwise only the
 * granted forms' submissions (empty grants → no rows).
 */
export async function getGuildSubmissions(guildId: string, scope: ReviewScope) {
  if (!scope.all && scope.formIds.length === 0) return [];
  return prisma.submission.findMany({
    where: { guildId, ...(scope.all ? {} : { formId: { in: scope.formIds } }) },
    orderBy: { submittedAt: "desc" },
    take: 100,
    select: {
      id: true,
      status: true,
      submittedAt: true,
      form: { select: { title: true } },
      user: { select: { username: true, avatar: true } },
    },
  });
}

/** Submissions the user themselves made, across all guilds, for "My Submissions". */
export async function getUserSubmissions(userId: string) {
  return prisma.submission.findMany({
    where: { userId },
    orderBy: { submittedAt: "desc" },
    select: {
      id: true,
      status: true,
      submittedAt: true,
      form: { select: { title: true } },
      guild: { select: { name: true } },
    },
  });
}
