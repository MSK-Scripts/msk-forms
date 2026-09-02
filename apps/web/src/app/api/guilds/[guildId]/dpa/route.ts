import { prisma } from "@msk-forms/db";
import { NextResponse, type NextRequest } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { canManageForms } from "@/lib/guild";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Record that the guild accepted the data processing agreement (Art. 28 GDPR).
 *
 * A form collects personal data from its applicants. The guild decides what is
 * asked and what happens to the answers, so the guild is the controller and we
 * are the processor, and Art. 28 wants that agreed before the processing
 * starts. The dashboard therefore asks once, in front of the form builder.
 *
 * Only someone who may manage forms can accept, because accepting binds the
 * guild. The write is guarded on the column still being null so a second click,
 * a double submit or a replayed request cannot move the recorded date; the
 * timestamp is the evidence, and evidence that silently changes is worth less
 * than none.
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ guildId: string }> },
) {
  const { guildId } = await params;

  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  if (!(await canManageForms(guildId, user.id))) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  await prisma.guild.updateMany({
    where: { id: guildId, dpaAcceptedAt: null },
    data: { dpaAcceptedAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
