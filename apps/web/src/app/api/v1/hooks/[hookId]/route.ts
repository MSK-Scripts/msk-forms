import { logGuildActivitySafe, prisma } from "@msk-forms/db";
import { NextResponse, type NextRequest } from "next/server";

import { authorizeV1 } from "@/lib/v1-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * REST-Hook unsubscribe (Zapier/Make "perform unsubscribe"). Deletes the hook if
 * it belongs to the API key's guild. Idempotent — a missing hook returns 204 so
 * the platform can safely retry. Enterprise-only.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ hookId: string }> },
) {
  const auth = await authorizeV1(request);
  if (auth instanceof NextResponse) return auth;

  const { hookId } = await params;

  // Guild-scoped delete: deleteMany never throws on a no-match, which keeps the
  // call idempotent and prevents probing for hooks in other guilds.
  const removed = await prisma.webhook.deleteMany({
    where: { id: hookId, guildId: auth.guildId, kind: "event" },
  });
  if (removed.count > 0) {
    await logGuildActivitySafe(auth.guildId, {
      action: "webhook_deleted",
      actorName: "API key",
      detail: "Integration unsubscribed",
    });
  }

  return new NextResponse(null, { status: 204 });
}
