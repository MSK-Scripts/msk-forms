import "server-only";

import { prisma } from "@msk-forms/db";
import { notFound } from "next/navigation";

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
