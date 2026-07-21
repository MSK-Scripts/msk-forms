import { Prisma, prisma } from "@msk-forms/db";
import { parseStatusMessages, statusMessagesSchema } from "@msk-forms/shared";
import { NextResponse, type NextRequest } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { canManageForms } from "@/lib/guild";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Save the guild-wide automatic per-status messages (manager-only). Blank
 * entries are dropped, so clearing a status' textbox removes its template.
 */
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

  const body = (await request.json().catch(() => null)) as { messages?: unknown } | null;
  const parsed = statusMessagesSchema.safeParse(body?.messages);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid messages." }, { status: 422 });
  }

  const messages = parseStatusMessages(parsed.data);
  await prisma.guild.update({
    where: { id: guildId },
    data: { statusMessages: messages as Prisma.InputJsonValue },
  });
  return NextResponse.json({ ok: true });
}
