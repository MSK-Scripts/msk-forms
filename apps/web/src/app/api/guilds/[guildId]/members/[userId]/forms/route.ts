import { prisma } from "@msk-forms/db";
import { NextResponse, type NextRequest } from "next/server";

import { countsTowardTeam } from "@/lib/access";
import { getCurrentUser } from "@/lib/auth";
import { canManageForms, countTeamMembers } from "@/lib/guild";
import { getGuildPlan } from "@/lib/plan";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

  // Each grant is a form the member may access; `manage` upgrades it from
  // review-only to full management of that single form. Legacy `formIds`
  // (review-only) is still accepted for compatibility.
  const body = (await request.json().catch(() => null)) as {
    grants?: unknown;
    formIds?: unknown;
  } | null;
  const requested: { formId: string; manage: boolean }[] | null = Array.isArray(body?.grants)
    ? body.grants
        .filter(
          (g): g is { formId: string; manage?: unknown } =>
            typeof g === "object" && g !== null && typeof (g as { formId?: unknown }).formId === "string",
        )
        .map((g) => ({ formId: g.formId, manage: (g as { manage?: unknown }).manage === true }))
    : Array.isArray(body?.formIds)
      ? body.formIds
          .filter((x): x is string => typeof x === "string")
          .map((formId) => ({ formId, manage: false }))
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
    where: { guildId, id: { in: requested.map((g) => g.formId) } },
    select: { id: true },
  });
  const valid = new Set(guildForms.map((f) => f.id));
  const grants = requested.filter((g) => valid.has(g.formId));

  // Plan member cap: only when this grant newly adds the user to the team.
  const currentGrants = await prisma.formReviewer.count({ where: { userId, form: { guildId } } });
  const countedBefore = countsTowardTeam(member.role, currentGrants > 0);
  const countsAfter = countsTowardTeam(member.role, grants.length > 0);
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
    ...(grants.length > 0
      ? [
          prisma.formReviewer.createMany({
            data: grants.map((g) => ({ formId: g.formId, userId, canManage: g.manage })),
          }),
        ]
      : []),
  ]);
  return NextResponse.json({ ok: true });
}
