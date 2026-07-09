import { prisma } from "@msk-forms/db";
import {
  FORM_DEFINITION_VERSION,
  parseFormSettings,
  type FormDefinition,
} from "@msk-forms/shared";
import { NextResponse, type NextRequest } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { parseFormSpec } from "@/lib/forms";
import { canManageForm } from "@/lib/guild";
import { isGuildPro } from "@/lib/plan";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Export a form's definition (structure + settings, not submissions) as a
 * portable JSON file. Requires a guild manager or per-form manager, and Pro+,
 * mirroring the import endpoint.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ guildId: string; formId: string }> },
) {
  const { guildId, formId } = await params;

  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  if (!(await canManageForm(guildId, user.id, formId))) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }
  if (!(await isGuildPro(guildId))) {
    return NextResponse.json(
      { error: "Exporting a form requires Pro.", code: "pro_required" },
      { status: 402 },
    );
  }

  const form = await prisma.form.findUnique({
    where: { id: formId },
    select: {
      guildId: true,
      slug: true,
      title: true,
      description: true,
      status: true,
      visibility: true,
      schema: true,
      settings: true,
      openAt: true,
      closeAt: true,
      category: { select: { name: true } },
    },
  });
  if (!form || form.guildId !== guildId) {
    return NextResponse.json({ error: "Form not found." }, { status: 404 });
  }

  const spec = parseFormSpec(form.schema);
  if (!spec) {
    return NextResponse.json({ error: "Form schema is invalid." }, { status: 422 });
  }

  const definition: FormDefinition = {
    mskForms: { type: "form-definition", version: FORM_DEFINITION_VERSION },
    exportedAt: new Date().toISOString(),
    form: {
      title: form.title,
      description: form.description,
      slug: form.slug,
      status: form.status,
      visibility: form.visibility,
      openAt: form.openAt ? form.openAt.toISOString() : null,
      closeAt: form.closeAt ? form.closeAt.toISOString() : null,
      category: form.category?.name ?? null,
    },
    spec,
    settings: parseFormSettings(form.settings),
  };

  const filename = `form-${form.slug || "definition"}-${new Date().toISOString().slice(0, 10)}.json`;
  return new NextResponse(JSON.stringify(definition, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
