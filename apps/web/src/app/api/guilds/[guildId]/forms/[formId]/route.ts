import { Prisma, prisma } from "@msk-forms/db";
import { NextResponse, type NextRequest } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { formInputSchema } from "@/lib/form-input";
import { canManageForms } from "@/lib/guild";
import { isGuildPro } from "@/lib/plan";
import { deleteObject } from "@/lib/s3";

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

  // Automations and A/B tests are Pro features — strip them for Free guilds.
  const settings = { ...(input.settings ?? {}) };
  if (!(await isGuildPro(guildId))) {
    delete (settings as { automations?: unknown }).automations;
    delete (settings as { experiment?: unknown }).experiment;
  }

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
        settings: settings as Prisma.InputJsonValue,
        openAt: input.openAt ? new Date(input.openAt) : null,
        closeAt: input.closeAt ? new Date(input.closeAt) : null,
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

/**
 * Delete a form and everything under it (versions, submissions, events, files,
 * status defs all cascade). Owner/admin only, form ∈ guild. Stored file objects
 * are purged from object storage best-effort after the row is gone.
 */
export async function DELETE(
  _request: NextRequest,
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

  // Collect stored object keys before the cascade removes the rows.
  const files = await prisma.fileUpload.findMany({
    where: { submission: { formId } },
    select: { storageKey: true },
  });

  await prisma.form.delete({ where: { id: formId } });
  await Promise.all(files.map((f) => deleteObject(f.storageKey)));

  return NextResponse.json({ ok: true });
}
