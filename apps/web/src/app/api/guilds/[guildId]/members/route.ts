import { prisma } from "@msk-forms/db";
import { NextResponse, type NextRequest } from "next/server";

import { countsTowardTeam } from "@/lib/access";
import { getCurrentUser } from "@/lib/auth";
import { discordAvatarUrl, fetchDiscordUserById } from "@/lib/discord";
import { canManageForms, countTeamMembers } from "@/lib/guild";
import { getGuildPlan } from "@/lib/plan";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SNOWFLAKE = /^\d{17,20}$/;
const ASSIGNABLE = ["viewer", "reviewer", "admin"] as const;
type AssignableRole = (typeof ASSIGNABLE)[number];

/**
 * Add a member by Discord user id (for people who haven't logged in yet).
 * Manager-only. Looks the user up via the bot token for a proper name/avatar,
 * upserts the User and the membership, and enforces the plan member cap.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ guildId: string }> },
) {
  const { guildId } = await params;

  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  if (!(await canManageForms(guildId, user.id))) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as
    | { discordId?: unknown; role?: unknown }
    | null;
  const discordId = typeof body?.discordId === "string" ? body.discordId.trim() : "";
  const role = body?.role as AssignableRole;
  if (!SNOWFLAKE.test(discordId)) {
    return NextResponse.json({ error: "Enter a valid Discord ID." }, { status: 422 });
  }
  if (!ASSIGNABLE.includes(role)) {
    return NextResponse.json({ error: "Invalid role." }, { status: 422 });
  }

  // Resolve a display name/avatar via the bot token (best-effort).
  const discordUser = await fetchDiscordUserById(discordId);
  const target = await prisma.user.upsert({
    where: { discordId },
    create: {
      discordId,
      username: discordUser?.username ?? discordId,
      avatar: discordUser ? discordAvatarUrl(discordUser) : null,
    },
    update: discordUser
      ? { username: discordUser.username, avatar: discordAvatarUrl(discordUser) }
      : {},
  });

  const existing = await prisma.guildMember.findUnique({
    where: { guildId_userId: { guildId, userId: target.id } },
    select: { role: true },
  });
  if (existing?.role === "owner") {
    return NextResponse.json({ error: "The owner role can’t be changed." }, { status: 403 });
  }

  // Plan member cap: only block when this newly adds someone to the team.
  const grants = await prisma.formReviewer.count({
    where: { userId: target.id, form: { guildId } },
  });
  const countedBefore = existing ? countsTowardTeam(existing.role, grants > 0) : false;
  if (countsTowardTeam(role, grants > 0) && !countedBefore) {
    const { memberLimit } = await getGuildPlan(guildId);
    if (memberLimit !== null && (await countTeamMembers(guildId)) >= memberLimit) {
      return NextResponse.json(
        { error: "Member limit reached.", code: "pro_required" },
        { status: 402 },
      );
    }
  }

  await prisma.guildMember.upsert({
    where: { guildId_userId: { guildId, userId: target.id } },
    create: { guildId, userId: target.id, role },
    update: { role },
  });
  return NextResponse.json({ ok: true });
}
