import { changeSubmissionStatus, enqueueWebhooks, prisma, type Prisma } from "@msk-forms/db";
import {
  buildAnswerSchema,
  DEFAULT_STATUSES,
  evaluateAutomations,
  evaluateFormula,
  FILE_FIELD_TYPES,
  formatAnswerValue,
  isComputedField,
  isFormOpenNow,
  isLayoutField,
  parseFormSettings,
  scoreSubmission,
  type FileAnswer,
  type FormSpec,
  type StatusChangeNotification,
  type SubmissionReviewNotification,
} from "@msk-forms/shared";
import { NextResponse, type NextRequest } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { captchaEnabled, verifyCaptcha } from "@/lib/captcha";
import { isPrimaryHostname, requestHostname } from "@/lib/custom-domain";
import { parseFormSpec, resolveStatus } from "@/lib/forms";
import { getGuildPlan } from "@/lib/plan";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { headObject } from "@/lib/s3";
import { getDict } from "@/i18n";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Per-IP submission cap: 8 submissions per minute (fails open without Redis). */
const SUBMIT_LIMIT = 8;
const SUBMIT_WINDOW_SECONDS = 60;

const PREVIEW_LABELS = { empty: "—", yes: "Yes", no: "No" } as const;

/** Short "Label: value" lines for the bot's review embed (first few fields). */
function buildPreview(spec: FormSpec, data: Record<string, unknown>): string[] {
  return spec.pages
    .flatMap((p) => p.fields)
    .filter((f) => !isLayoutField(f.type))
    .slice(0, 6)
    .map((f) => `${f.label ?? f.id}: ${formatAnswerValue(f, data[f.id], PREVIEW_LABELS).slice(0, 100)}`);
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

  // Captcha (only enforced when Turnstile keys are configured AND the request is
  // on the primary host). Custom domains can't render the global Turnstile widget
  // (its hostname allowlist), so we don't require a token there — those forms are
  // covered by the per-IP rate limit above.
  const host = await requestHostname();
  const captchaApplies = captchaEnabled() && (!host || isPrimaryHostname(host));
  if (captchaApplies) {
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
    select: {
      id: true,
      guildId: true,
      status: true,
      schema: true,
      title: true,
      settings: true,
      openAt: true,
      closeAt: true,
    },
  });

  if (!form || form.status !== "live") {
    return NextResponse.json({ error: "Form not available." }, { status: 404 });
  }

  // Scheduling window: reject before it opens or after it closes.
  if (!isFormOpenNow(form.openAt, form.closeAt, new Date())) {
    return NextResponse.json({ error: "This form isn’t open right now." }, { status: 403 });
  }

  const spec = parseFormSpec(form.schema);
  if (!spec) {
    return NextResponse.json({ error: "Form is misconfigured." }, { status: 500 });
  }

  // Plan quota: cap submissions per calendar month per guild (Free 100 / Pro
  // 5.000 / Enterprise unlimited, concept §21).
  const { monthlySubmissionLimit } = await getGuildPlan(form.guildId);
  if (monthlySubmissionLimit !== null) {
    const now = new Date();
    const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const used = await prisma.submission.count({
      where: { guildId: form.guildId, submittedAt: { gte: monthStart } },
    });
    if (used >= monthlySubmissionLimit) {
      return NextResponse.json(
        { error: "This form isn’t accepting submissions right now." },
        { status: 403 },
      );
    }
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
  // form's upload prefix — that's what ties an uploaded object to this form —
  // and the object must actually exist in storage. We trust the *server-stored*
  // size/type (via HEAD), not the client-supplied descriptor; only the display
  // filename comes from the client (and is never used to address the object).
  const data = result.data as Record<string, unknown>;

  // Compute calculated fields server-side (authoritative — the client preview is
  // never trusted). In document order, so a calculated field may reference an
  // earlier one. The result is stored alongside the entered answers.
  const fieldsById = new Map(spec.pages.flatMap((p) => p.fields).map((f) => [f.id, f]));
  for (const f of fieldsById.values()) {
    if (isComputedField(f.type)) data[f.id] = evaluateFormula(f.formula, fieldsById, data);
  }

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
    const head = await headObject(v.key);
    if (!head) {
      return NextResponse.json({ error: "Invalid file reference." }, { status: 400 });
    }
    fileRows.push({
      fieldId: f.id,
      filename: v.name,
      mime: head.contentType,
      size: head.contentLength,
      storageKey: v.key,
    });
  }

  const user = await getCurrentUser();
  // Quiz score (null when the form has no scored options).
  const score = scoreSubmission(spec, data);

  const submission = await prisma.submission.create({
    data: {
      formId: form.id,
      guildId: form.guildId,
      userId: user?.id ?? null,
      answers: result.data as Prisma.InputJsonValue,
      score,
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

  // Queue any subscribed webhook deliveries (best-effort — never fail the submit).
  try {
    await enqueueWebhooks(prisma, form.guildId, "submission.created", {
      event: "submission.created",
      guildId: form.guildId,
      submissionId: submission.id,
      formId: form.id,
      at: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[submit] failed to queue webhooks:", (err as Error).message);
  }

  // Automations: move the submission per the first matching when-then rule
  // (concept §20). Best-effort — never fail the submit. The status change
  // cascades through changeSubmissionStatus (event, DM, webhook, realtime).
  try {
    const { automations } = parseFormSettings(form.settings);
    // Expose the quiz score to rules under the reserved `__score` field.
    const autoAnswers = score != null ? { ...data, __score: score } : data;
    const target = automations.length > 0 ? evaluateAutomations(automations, autoAnswers) : null;
    if (target && target !== "submitted") {
      const defs = await prisma.formStatusDef.findMany({
        where: { guildId: form.guildId },
        select: { key: true, label: true, color: true },
      });
      const allowed = new Set<string>([
        ...DEFAULT_STATUSES.map((s) => s.key),
        ...defs.map((d) => d.key),
      ]);
      if (allowed.has(target)) {
        const notify: StatusChangeNotification | null = user?.id
          ? {
              submissionId: submission.id,
              formTitle: form.title,
              toStatus: target,
              toStatusLabel: resolveStatus(target, defs, (await getDict()).statusLabels).label,
            }
          : null;
        await changeSubmissionStatus({
          submissionId: submission.id,
          toStatus: target,
          actorUserId: null,
          notify: user?.id && notify ? { userId: user.id, type: "status_change", payload: notify } : null,
        });
      }
    }
  } catch (err) {
    console.error("[submit] automation failed:", (err as Error).message);
  }

  return NextResponse.json({ submissionId: submission.id }, { status: 201 });
}
