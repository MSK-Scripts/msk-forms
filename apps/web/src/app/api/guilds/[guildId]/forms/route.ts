import { logGuildActivitySafe, Prisma, prisma } from "@msk-forms/db";
import { FREE_FORM_LIMIT } from "@msk-forms/shared";
import { NextResponse, type NextRequest } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { formInputSchema } from "@/lib/form-input";
import { canManageForms } from "@/lib/guild";
import { isGuildPro } from "@/lib/plan";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Create a new form in a guild. Requires owner/admin. */
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

  const parsed = formInputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid form." },
      { status: 422 },
    );
  }
  const input = parsed.data;

  // Plan limits: Free guilds are capped at FREE_FORM_LIMIT forms and can't use
  // automations. Strip automations rather than failing the whole save.
  const pro = await isGuildPro(guildId);
  if (!pro) {
    const count = await prisma.form.count({ where: { guildId } });
    if (count >= FREE_FORM_LIMIT) {
      return NextResponse.json(
        { error: "Free plan form limit reached.", code: "pro_required" },
        { status: 402 },
      );
    }
  }
  const settings = { ...(input.settings ?? {}) };
  if (!pro) {
    // Automations and A/B tests are Pro features — strip rather than fail.
    delete (settings as { automations?: unknown }).automations;
    delete (settings as { experiment?: unknown }).experiment;
  }

  try {
    const form = await prisma.form.create({
      data: {
        guildId,
        slug: input.slug,
        title: input.title,
        description: input.description ?? null,
        status: input.status,
        visibility: input.visibility,
        schema: input.spec as Prisma.InputJsonValue,
        settings: settings as Prisma.InputJsonValue,
        openAt: input.openAt ? new Date(input.openAt) : null,
        closeAt: input.closeAt ? new Date(input.closeAt) : null,
        createdById: user.id,
      },
      select: { id: true },
    });
    await logGuildActivitySafe(guildId, {
      action: "form_created",
      actorName: user.username,
      formTitle: input.title,
    });
    return NextResponse.json({ id: form.id }, { status: 201 });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return NextResponse.json({ error: "That slug is already taken." }, { status: 409 });
    }
    throw err;
  }
}
