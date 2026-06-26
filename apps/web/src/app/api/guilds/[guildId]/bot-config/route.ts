import { logGuildActivitySafe, Prisma, prisma } from "@msk-forms/db";
import { botConfigSchema } from "@msk-forms/shared";
import { NextResponse, type NextRequest } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { canManageForms } from "@/lib/guild";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Update a guild's bot configuration (review channel, accepted role). Owner/admin only. */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ guildId: string }> },
) {
  const { guildId } = await params;

  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  if (!(await canManageForms(guildId, user.id))) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const parsed = botConfigSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid configuration." },
      { status: 422 },
    );
  }

  await prisma.guild.update({
    where: { id: guildId },
    data: { botConfig: parsed.data as Prisma.InputJsonValue },
  });
  await logGuildActivitySafe(guildId, {
    action: "bot_config_updated",
    actorName: user.username,
  });
  return NextResponse.json({ ok: true });
}
