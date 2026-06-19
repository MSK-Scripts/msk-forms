import { prisma, type Prisma } from "@msk-forms/db";
import { buildAnswerSchema } from "@msk-forms/shared";
import { NextResponse, type NextRequest } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { parseFormSpec } from "@/lib/forms";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Public submission endpoint. Validates answers server-side against the form's
 * spec (never trust the client), creates the submission and its initial
 * status event, and returns the submission UUID (the applicant's status link).
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const answers = (body as { answers?: unknown })?.answers;
  if (typeof answers !== "object" || answers === null) {
    return NextResponse.json({ error: "Missing answers." }, { status: 400 });
  }

  const form = await prisma.form.findUnique({
    where: { slug },
    select: { id: true, guildId: true, status: true, schema: true },
  });

  if (!form || form.status !== "live") {
    return NextResponse.json({ error: "Form not available." }, { status: 404 });
  }

  const spec = parseFormSpec(form.schema);
  if (!spec) {
    return NextResponse.json({ error: "Form is misconfigured." }, { status: 500 });
  }

  // Server-side validation against the form definition.
  const result = buildAnswerSchema(spec).safeParse(answers);
  if (!result.success) {
    return NextResponse.json(
      { error: "Some answers are invalid or missing." },
      { status: 422 },
    );
  }

  const user = await getCurrentUser();

  const submission = await prisma.submission.create({
    data: {
      formId: form.id,
      guildId: form.guildId,
      userId: user?.id ?? null,
      answers: result.data as Prisma.InputJsonValue,
      status: "submitted",
      events: {
        create: {
          type: "status_change",
          toStatus: "submitted",
          visibility: "public",
          actorUserId: user?.id ?? null,
        },
      },
    },
    select: { id: true },
  });

  return NextResponse.json({ submissionId: submission.id }, { status: 201 });
}
