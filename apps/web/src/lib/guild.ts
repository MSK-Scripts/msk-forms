import "server-only";

import { prisma } from "@msk-forms/db";
import { notFound } from "next/navigation";

/** Roles allowed to create/edit/manage a guild's forms (concept §17). */
export const MANAGER_ROLES = ["owner", "admin"] as const;

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

/** True if the user may manage (create/edit) the guild's forms. */
export async function canManageForms(guildId: string, userId: string): Promise<boolean> {
  const role = await getGuildRole(guildId, userId);
  return role !== null && (MANAGER_ROLES as readonly string[]).includes(role);
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

/** Submissions across a guild's forms, for the "Guild Submissions" tab. */
export async function getGuildSubmissions(guildId: string) {
  return prisma.submission.findMany({
    where: { guildId },
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
