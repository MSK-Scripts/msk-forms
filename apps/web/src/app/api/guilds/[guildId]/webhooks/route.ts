import { randomBytes } from "node:crypto";

import { prisma } from "@msk-forms/db";
import { webhookInputSchema } from "@msk-forms/shared";
import { NextResponse, type NextRequest } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { canManageForms } from "@/lib/guild";
import { isGuildPro } from "@/lib/plan";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Max webhook endpoints per guild. */
const MAX_WEBHOOKS = 20;

/** List a guild's webhook endpoints (manager-only; includes the signing secret). */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ guildId: string }> },
) {
  const { guildId } = await params;

  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  if (!(await canManageForms(guildId, user.id))) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const webhooks = await prisma.webhook.findMany({
    where: { guildId },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      url: true,
      secret: true,
      events: true,
      active: true,
      format: true,
      formId: true,
      createdAt: true,
    },
  });
  return NextResponse.json({ webhooks });
}

/** Register a new webhook endpoint (manager-only). Generates the signing secret. */
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
  if (!(await isGuildPro(guildId))) {
    return NextResponse.json({ error: "Pro plan required.", code: "pro_required" }, { status: 402 });
  }

  const parsed = webhookInputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid webhook." },
      { status: 422 },
    );
  }

  if ((await prisma.webhook.count({ where: { guildId } })) >= MAX_WEBHOOKS) {
    return NextResponse.json({ error: "Too many webhooks." }, { status: 422 });
  }

  // A form-scoped webhook must target a form that belongs to this guild.
  const formId = parsed.data.formId ?? null;
  if (formId) {
    const form = await prisma.form.findFirst({
      where: { id: formId, guildId },
      select: { id: true },
    });
    if (!form) return NextResponse.json({ error: "Form not found." }, { status: 422 });
  }

  const webhook = await prisma.webhook.create({
    data: {
      guildId,
      url: parsed.data.url,
      events: parsed.data.events,
      active: parsed.data.active,
      format: parsed.data.format,
      formId,
      secret: randomBytes(24).toString("hex"),
    },
    select: {
      id: true,
      url: true,
      secret: true,
      events: true,
      active: true,
      format: true,
      formId: true,
      createdAt: true,
    },
  });
  return NextResponse.json({ webhook }, { status: 201 });
}
