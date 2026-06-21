import { Prisma, prisma } from "@msk-forms/db";
import { NextResponse, type NextRequest } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { formInputSchema } from "@/lib/form-input";
import { canManageForms } from "@/lib/guild";

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
        settings: (input.settings ?? {}) as Prisma.InputJsonValue,
        createdById: user.id,
      },
      select: { id: true },
    });
    return NextResponse.json({ id: form.id }, { status: 201 });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return NextResponse.json({ error: "That slug is already taken." }, { status: 409 });
    }
    throw err;
  }
}
