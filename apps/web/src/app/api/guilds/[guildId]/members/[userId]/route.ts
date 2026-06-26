import { logGuildActivitySafe, prisma } from "@msk-forms/db";
import { NextResponse, type NextRequest } from "next/server";

import { countsTowardTeam } from "@/lib/access";
import { getCurrentUser } from "@/lib/auth";
import { canManageForms, countTeamMembers } from "@/lib/guild";
import { getGuildPlan } from "@/lib/plan";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Roles a manager may assign (never `owner` — that's set on bot invite). */
const ASSIGNABLE = ["viewer", "reviewer", "admin"] as const;
type AssignableRole = (typeof ASSIGNABLE)[number];

/** Change a member's guild role. Manager-only; can't touch the owner. */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ guildId: string; userId: string }> },
) {
  const { guildId, userId } = await params;

  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  if (!(await canManageForms(guildId, user.id))) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as { role?: unknown } | null;
  const role = body?.role as AssignableRole;
  if (!ASSIGNABLE.includes(role)) {
    return NextResponse.json({ error: "Invalid role." }, { status: 422 });
  }

  const member = await prisma.guildMember.findUnique({
    where: { guildId_userId: { guildId, userId } },
    select: { role: true, user: { select: { username: true } } },
  });
  if (!member) return NextResponse.json({ error: "Member not found." }, { status: 404 });
  if (member.role === "owner") {
    return NextResponse.json({ error: "The owner role can’t be changed." }, { status: 403 });
  }

  // Plan member cap: only block when this change newly adds someone to the team.
  const grants = await prisma.formReviewer.count({ where: { userId, form: { guildId } } });
  const countedBefore = countsTowardTeam(member.role, grants > 0);
  const countsAfter = countsTowardTeam(role, grants > 0);
  if (countsAfter && !countedBefore) {
    const { memberLimit } = await getGuildPlan(guildId);
    if (memberLimit !== null && (await countTeamMembers(guildId)) >= memberLimit) {
      return NextResponse.json(
        { error: "Member limit reached.", code: "pro_required" },
        { status: 402 },
      );
    }
  }

  await prisma.guildMember.update({
    where: { guildId_userId: { guildId, userId } },
    data: { role },
  });
  await logGuildActivitySafe(guildId, {
    action: "member_role_changed",
    actorName: user.username,
    detail: `${member.user?.username ?? userId}: ${member.role} → ${role}`,
  });
  return NextResponse.json({ ok: true });
}

/** Remove a member from the guild. Manager-only; can't remove the owner. */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ guildId: string; userId: string }> },
) {
  const { guildId, userId } = await params;

  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  if (!(await canManageForms(guildId, user.id))) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const member = await prisma.guildMember.findUnique({
    where: { guildId_userId: { guildId, userId } },
    select: { role: true, user: { select: { username: true } } },
  });
  if (!member) return NextResponse.json({ error: "Member not found." }, { status: 404 });
  if (member.role === "owner") {
    return NextResponse.json({ error: "The owner can’t be removed." }, { status: 403 });
  }

  // Drop the membership and any per-form grants this user had in the guild.
  await prisma.$transaction([
    prisma.formReviewer.deleteMany({ where: { userId, form: { guildId } } }),
    prisma.guildMember.delete({ where: { guildId_userId: { guildId, userId } } }),
  ]);
  await logGuildActivitySafe(guildId, {
    action: "member_removed",
    actorName: user.username,
    detail: member.user?.username ?? userId,
  });
  return NextResponse.json({ ok: true });
}
