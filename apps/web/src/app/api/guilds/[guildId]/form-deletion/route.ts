import { enqueueGuildLog, prisma } from "@msk-forms/db";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { actor } from "@/lib/audit";
import { getCurrentUser } from "@/lib/auth";
import { getGuildRole } from "@/lib/guild";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({ adminsCanDelete: z.boolean() });

/**
 * Allow or forbid admins to permanently delete archived forms. Owner-only: an
 * admin must not be able to hand this right to themselves.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ guildId: string }> },
) {
  const { guildId } = await params;

  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  if ((await getGuildRole(guildId, user.id)) !== "owner") {
    return NextResponse.json({ error: "Only the owner can change this." }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 422 });
  }
  const allow = parsed.data.adminsCanDelete;

  await prisma.$transaction(async (tx) => {
    const updated = await tx.guild.updateMany({
      where: { id: guildId, adminsCanDeleteForms: !allow },
      data: { adminsCanDeleteForms: allow },
    });
    if (updated.count === 0) return;
    await enqueueGuildLog(tx, guildId, {
      action: "form_delete_setting_updated",
      ...actor(user),
      detail: allow
        ? "Admins may now permanently delete archived forms"
        : "Only the owner may permanently delete archived forms",
    });
  });

  return NextResponse.json({ ok: true, adminsCanDelete: allow });
}
