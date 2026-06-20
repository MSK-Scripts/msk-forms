import { prisma, type Prisma } from "@msk-forms/db";
import {
  buildAnswerSchema,
  FILE_FIELD_TYPES,
  type FileAnswer,
  type FormField,
  type FormSpec,
  type SubmissionReviewNotification,
} from "@msk-forms/shared";
import { NextResponse, type NextRequest } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { captchaEnabled, verifyCaptcha } from "@/lib/captcha";
import { parseFormSpec } from "@/lib/forms";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Per-IP submission cap: 8 submissions per minute (fails open without Redis). */
const SUBMIT_LIMIT = 8;
const SUBMIT_WINDOW_SECONDS = 60;

const LAYOUT_TYPES = ["section_break", "heading", "paragraph", "image_block", "divider", "spacer"];

/** Short "Label: value" lines for the bot's review embed (first few fields). */
function buildPreview(spec: FormSpec, data: Record<string, unknown>): string[] {
  const labelFor = (field: FormField, v: string) =>
    field.options?.find((o) => o.value === v)?.label ?? v;
  const valueOf = (field: FormField, value: unknown): string => {
    if (value === undefined || value === null || value === "") return "—";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (Array.isArray(value)) return value.map((v) => labelFor(field, String(v))).join(", ");
    // null/undefined already returned above, so a plain object check suffices.
    if (typeof value === "object" && "name" in value) {
      return String((value as { name: unknown }).name);
    }
    if (field.options) return labelFor(field, String(value));
    return String(value);
  };

  return spec.pages
    .flatMap((p) => p.fields)
    .filter((f) => !LAYOUT_TYPES.includes(f.type))
    .slice(0, 6)
    .map((f) => `${f.label ?? f.id}: ${valueOf(f, data[f.id]).slice(0, 100)}`);
}

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
  const ip = clientIp(request.headers);

  // Throttle abusive clients before doing any work. Fails open if Redis is down.
  const rl = await rateLimit(`submit:${ip}`, SUBMIT_LIMIT, SUBMIT_WINDOW_SECONDS);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many submissions. Please try again in a moment." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
    );
  }

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

  // Captcha (only enforced when Turnstile keys are configured).
  if (captchaEnabled()) {
    const token = (body as { captchaToken?: unknown }).captchaToken;
    const ok = await verifyCaptcha(typeof token === "string" ? token : undefined, ip);
    if (!ok) {
      return NextResponse.json(
        { error: "Captcha verification failed. Please try again." },
        { status: 400 },
      );
    }
  }

  const form = await prisma.form.findUnique({
    where: { slug },
    select: { id: true, guildId: true, status: true, schema: true, title: true },
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

  // Turn file-field answers into FileUpload rows. Keys must live under this
  // form's upload prefix — that's what ties an uploaded object to this form.
  const data = result.data as Record<string, unknown>;
  const fileFields = spec.pages
    .flatMap((p) => p.fields)
    .filter((f) => (FILE_FIELD_TYPES as readonly string[]).includes(f.type));
  const fileRows: { fieldId: string; filename: string; mime: string; size: number; storageKey: string }[] = [];
  for (const f of fileFields) {
    const v = data[f.id] as FileAnswer | undefined;
    if (!v) continue;
    if (!v.key.startsWith(`uploads/${form.id}/`)) {
      return NextResponse.json({ error: "Invalid file reference." }, { status: 400 });
    }
    fileRows.push({ fieldId: f.id, filename: v.name, mime: v.mime, size: v.size, storageKey: v.key });
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
      ...(fileRows.length > 0 ? { files: { create: fileRows } } : {}),
    },
    select: { id: true },
  });

  // Outbox: announce the new submission in the guild's review channel (the bot
  // delivers it). Best-effort — never fail the submit if this can't be queued.
  try {
    const payload: SubmissionReviewNotification = {
      submissionId: submission.id,
      formTitle: form.title,
      applicantName: user?.username ?? "Anonymous",
      preview: buildPreview(spec, data),
    };
    await prisma.notification.create({
      data: {
        guildId: form.guildId,
        type: "submission_review",
        payload: payload as unknown as Prisma.InputJsonValue,
      },
    });
  } catch (err) {
    console.error("[submit] failed to queue review notification:", (err as Error).message);
  }

  return NextResponse.json({ submissionId: submission.id }, { status: 201 });
}
