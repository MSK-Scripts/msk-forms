import { enqueueGuildLog, prisma } from "@msk-forms/db";
import { FREE_FORM_LIMIT } from "@msk-forms/shared";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { actor } from "@/lib/audit";
import { getCurrentUser } from "@/lib/auth";
import { canManageForm } from "@/lib/guild";
import { isGuildPro } from "@/lib/plan";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({ archived: z.boolean() });

/**
 * Archive or restore a form. Anyone who may manage the form can do both; this is
 * what "delete" in the forms list does now. Archiving hides the form from the
 * dashboard list, the public link, the hub and the bot, and hides its
 * submissions from the lists, but keeps every row. Restoring brings the form back
 * with the status it had. Permanent deletion is a separate, narrower right.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ guildId: string; formId: string }> },
) {
  const { guildId, formId } = await params;

  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  if (!(await canManageForm(guildId, user.id, formId))) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 422 });
  }
  const archive = parsed.data.archived;

  const form = await prisma.form.findUnique({
    where: { id: formId },
    select: { guildId: true, title: true, archivedAt: true },
  });
  if (!form || form.guildId !== guildId) {
    return NextResponse.json({ error: "Form not found." }, { status: 404 });
  }
  // Already in the requested state: nothing to do, and nothing to log.
  if (Boolean(form.archivedAt) === archive) return NextResponse.json({ ok: true });

  // Restoring must respect the Free plan form limit, otherwise archive and
  // restore would be a way around it.
  if (!archive && !(await isGuildPro(guildId))) {
    const active = await prisma.form.count({ where: { guildId, archivedAt: null } });
    if (active >= FREE_FORM_LIMIT) {
      return NextResponse.json(
        { error: "Free plan form limit reached.", code: "pro_required" },
        { status: 402 },
      );
    }
  }

  await prisma.$transaction(async (tx) => {
    // Guarded on the current state so a double click cannot log twice.
    const updated = await tx.form.updateMany({
      where: { id: formId, archivedAt: archive ? null : { not: null } },
      data: archive
        ? { archivedAt: new Date(), archivedById: user.id }
        : { archivedAt: null, archivedById: null },
    });
    if (updated.count === 0) return;
    await enqueueGuildLog(tx, guildId, {
      action: archive ? "form_archived" : "form_restored",
      ...actor(user),
      formTitle: form.title,
      formId,
    });
  });

  return NextResponse.json({ ok: true });
}
