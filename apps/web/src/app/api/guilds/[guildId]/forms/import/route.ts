import { randomBytes } from "node:crypto";

import { logGuildActivitySafe, Prisma, prisma } from "@msk-forms/db";
import { formDefinitionSchema } from "@msk-forms/shared";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth";
import { resolveOrCreateCategoryByName } from "@/lib/forms";
import { canManageForms } from "@/lib/guild";
import { isGuildPro } from "@/lib/plan";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const importBodySchema = z.object({
  mode: z.enum(["create", "replace"]),
  formId: z.string().uuid().optional(),
  definition: formDefinitionSchema,
});

/** Build a slug variant that fits the 80-char limit: `<base>-<4 hex>`. */
function slugVariant(base: string): string {
  return `${base.slice(0, 74)}-${randomBytes(2).toString("hex")}`;
}

/**
 * Import a form definition (JSON) as a new form (`create`) or overwrite an
 * existing one (`replace`). Manager-only and Pro+. On create, the suggested
 * slug is reused when free and suffixed on collision; on replace, the target's
 * slug is kept so its public link stays stable.
 */
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
    return NextResponse.json(
      { error: "Importing a form requires Pro.", code: "pro_required" },
      { status: 402 },
    );
  }

  const parsed = importBodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid form file." },
      { status: 422 },
    );
  }
  const { mode, formId, definition } = parsed.data;
  const f = definition.form;
  // The definition carries a category name; resolve it against this guild
  // (creating it if missing) so it survives a move between guilds.
  const categoryId = await resolveOrCreateCategoryByName(guildId, f.category);
  const common = {
    title: f.title,
    description: f.description ?? null,
    status: f.status,
    visibility: f.visibility,
    schema: definition.spec as Prisma.InputJsonValue,
    settings: definition.settings as Prisma.InputJsonValue,
    openAt: f.openAt ? new Date(f.openAt) : null,
    closeAt: f.closeAt ? new Date(f.closeAt) : null,
    categoryId,
  };

  if (mode === "replace") {
    if (!formId) {
      return NextResponse.json({ error: "formId is required to replace." }, { status: 422 });
    }
    const existing = await prisma.form.findUnique({
      where: { id: formId },
      select: { guildId: true },
    });
    if (!existing || existing.guildId !== guildId) {
      return NextResponse.json({ error: "Form not found." }, { status: 404 });
    }
    // Keep the existing slug so the public link does not change.
    await prisma.form.update({
      where: { id: formId },
      data: { ...common, version: { increment: 1 } },
    });
    await logGuildActivitySafe(guildId, {
      action: "form_updated",
      actorName: user.username,
      formTitle: f.title,
    });
    return NextResponse.json({ id: formId });
  }

  // create: try the exported slug first, then suffix on collision.
  let slug = f.slug;
  for (let attempt = 0; attempt < 6; attempt++) {
    try {
      const form = await prisma.form.create({
        data: { ...common, guildId, slug, createdById: user.id },
        select: { id: true, slug: true },
      });
      await logGuildActivitySafe(guildId, {
        action: "form_created",
        actorName: user.username,
        formTitle: f.title,
      });
      return NextResponse.json({ id: form.id, slug: form.slug }, { status: 201 });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        slug = slugVariant(f.slug);
        continue;
      }
      throw err;
    }
  }
  return NextResponse.json({ error: "Could not allocate a unique slug." }, { status: 409 });
}
