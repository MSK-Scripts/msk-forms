import { Prisma, prisma } from "@msk-forms/db";
import { brandingColorSchema, sanitizeCustomCss, type Branding } from "@msk-forms/shared";
import { NextResponse, type NextRequest } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { parseBranding } from "@/lib/branding";
import { canManageForms } from "@/lib/guild";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Update a guild's accent color + custom CSS. Owner/admin only. Preserves the logo. */
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

  const parsed = brandingColorSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid branding." },
      { status: 422 },
    );
  }

  // Read-merge-write so the separately-managed logo isn't clobbered.
  const guild = await prisma.guild.findUnique({
    where: { id: guildId },
    select: { branding: true },
  });
  const next: Branding = { ...parseBranding(guild?.branding) };
  if (parsed.data.accentColor) next.accentColor = parsed.data.accentColor;
  else delete next.accentColor;

  // Store the CSS already sanitized (defence in depth — it's sanitized again on render).
  const css = parsed.data.customCss ? sanitizeCustomCss(parsed.data.customCss).trim() : "";
  if (css) next.customCss = css;
  else delete next.customCss;

  await prisma.guild.update({
    where: { id: guildId },
    data: { branding: next as Prisma.InputJsonValue },
  });
  return NextResponse.json({ ok: true });
}
