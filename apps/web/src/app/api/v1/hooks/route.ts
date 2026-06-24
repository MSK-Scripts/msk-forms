import { randomBytes } from "node:crypto";

import { prisma } from "@msk-forms/db";
import { webhookSubscribeSchema } from "@msk-forms/shared";
import { NextResponse, type NextRequest } from "next/server";

import { authorizeV1 } from "@/lib/v1-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Max webhook endpoints per guild (shared with the dashboard manual webhooks). */
const MAX_WEBHOOKS = 50;

/**
 * REST-Hook subscribe (Zapier/Make "perform subscribe"). Registers a delivery
 * endpoint for one event, scoped to the API key's guild. Returns the hook id —
 * the integration stores it and later calls `DELETE /api/v1/hooks/{id}` to
 * unsubscribe. Enterprise-only.
 */
export async function POST(request: NextRequest) {
  const auth = await authorizeV1(request);
  if (auth instanceof NextResponse) return auth;

  const parsed = webhookSubscribeSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid subscription." },
      { status: 422 },
    );
  }

  if ((await prisma.webhook.count({ where: { guildId: auth.guildId } })) >= MAX_WEBHOOKS) {
    return NextResponse.json({ error: "Too many webhooks." }, { status: 422 });
  }

  const hook = await prisma.webhook.create({
    data: {
      guildId: auth.guildId,
      url: parsed.data.targetUrl,
      events: [parsed.data.event],
      source: parsed.data.source,
      secret: randomBytes(24).toString("hex"),
    },
    select: { id: true, url: true, events: true, secret: true, source: true, createdAt: true },
  });

  return NextResponse.json({ hook }, { status: 201 });
}

/** List the guild's webhook subscriptions (integration-managed and manual). */
export async function GET(request: NextRequest) {
  const auth = await authorizeV1(request);
  if (auth instanceof NextResponse) return auth;

  const hooks = await prisma.webhook.findMany({
    where: { guildId: auth.guildId },
    orderBy: { createdAt: "asc" },
    select: { id: true, url: true, events: true, active: true, source: true, createdAt: true },
  });
  return NextResponse.json({ hooks }, { headers: { "Cache-Control": "no-store" } });
}
