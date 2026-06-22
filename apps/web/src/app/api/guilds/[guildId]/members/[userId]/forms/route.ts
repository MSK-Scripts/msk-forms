import { prisma } from "@msk-forms/db";
import { NextResponse, type NextRequest } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { canManageForms, countTeamMembers, REVIEWER_ROLES } from "@/lib/guild";
import { getGuildPlan } from "@/lib/plan";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const isCountingRole = (role: string) => (REVIEWER_ROLES as readonly string[]).includes(role);

/**
 * Replace a member's per-form reviewer grants for this guild. Manager-only.
 * Granting a viewer their first form adds them to the team (plan member cap).
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ guildId: string; userId: string }> },
) {
  const { guildId, userId } = await params;

  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  if (!(await canManageForms(guildId, user.id))) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as { formIds?: unknown } | null;
  const requested = Array.isArray(body?.formIds)
    ? body.formIds.filter((x): x is string => typeof x === "string")
    : null;
  if (requested === null) {
    return NextResponse.json({ error: "Invalid request." }, { status: 422 });
  }

  const member = await prisma.guildMember.findUnique({
    where: { guildId_userId: { guildId, userId } },
    select: { role: true },
  });
  if (!member) return NextResponse.json({ error: "Member not found." }, { status: 404 });

  // Keep only ids that are actually this guild's forms.
  const guildForms = await prisma.form.findMany({
    where: { guildId, id: { in: requested } },
    select: { id: true },
  });
  const formIds = guildForms.map((f) => f.id);

  // Plan member cap: only when this grant newly adds the user to the team.
  const currentGrants = await prisma.formReviewer.count({ where: { userId, form: { guildId } } });
  const countedBefore = isCountingRole(member.role) || currentGrants > 0;
  const countsAfter = isCountingRole(member.role) || formIds.length > 0;
  if (countsAfter && !countedBefore) {
    const { memberLimit } = await getGuildPlan(guildId);
    if (memberLimit !== null && (await countTeamMembers(guildId)) >= memberLimit) {
      return NextResponse.json(
        { error: "Member limit reached.", code: "pro_required" },
        { status: 402 },
      );
    }
  }

  // Replace the grants atomically.
  await prisma.$transaction([
    prisma.formReviewer.deleteMany({ where: { userId, form: { guildId } } }),
    ...(formIds.length > 0
      ? [prisma.formReviewer.createMany({ data: formIds.map((formId) => ({ formId, userId })) })]
      : []),
  ]);
  return NextResponse.json({ ok: true });
}
