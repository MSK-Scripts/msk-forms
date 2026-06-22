import { prisma } from "@msk-forms/db";
import { NextResponse, type NextRequest } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { canManageForms } from "@/lib/guild";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Enable/disable a webhook endpoint (manager-only). */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ guildId: string; webhookId: string }> },
) {
  const { guildId, webhookId } = await params;

  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  if (!(await canManageForms(guildId, user.id))) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as { active?: unknown } | null;
  if (typeof body?.active !== "boolean") {
    return NextResponse.json({ error: "Invalid request." }, { status: 422 });
  }

  // Scope the update to this guild so one guild can't toggle another's webhook.
  const result = await prisma.webhook.updateMany({
    where: { id: webhookId, guildId },
    data: { active: body.active },
  });
  if (result.count === 0) {
    return NextResponse.json({ error: "Webhook not found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}

/** Delete a webhook endpoint and its queued deliveries (manager-only). */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ guildId: string; webhookId: string }> },
) {
  const { guildId, webhookId } = await params;

  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  if (!(await canManageForms(guildId, user.id))) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const result = await prisma.webhook.deleteMany({ where: { id: webhookId, guildId } });
  if (result.count === 0) {
    return NextResponse.json({ error: "Webhook not found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
