import { Prisma, prisma } from "@msk-forms/db";
import { NextResponse, type NextRequest } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { formInputSchema } from "@/lib/form-input";
import { canManageForms } from "@/lib/guild";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Update an existing form. Requires owner/admin and form ∈ guild. */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ guildId: string; formId: string }> },
) {
  const { guildId, formId } = await params;

  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  if (!(await canManageForms(guildId, user.id))) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const existing = await prisma.form.findUnique({
    where: { id: formId },
    select: { guildId: true },
  });
  if (!existing || existing.guildId !== guildId) {
    return NextResponse.json({ error: "Form not found." }, { status: 404 });
  }

  const parsed = formInputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid form." },
      { status: 422 },
    );
  }
  const input = parsed.data;

  try {
    await prisma.form.update({
      where: { id: formId },
      data: {
        slug: input.slug,
        title: input.title,
        description: input.description ?? null,
        status: input.status,
        visibility: input.visibility,
        schema: input.spec as Prisma.InputJsonValue,
        version: { increment: 1 },
      },
    });
    return NextResponse.json({ id: formId });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return NextResponse.json({ error: "That slug is already taken." }, { status: 409 });
    }
    throw err;
  }
}
