import { prisma } from "@msk-forms/db";
import { parseStatusMessages, resolveStatusMessage } from "@msk-forms/shared";
import { SubmissionStatusBadge } from "@msk-forms/ui";
import { notFound } from "next/navigation";

import { EmptyState, PageHeader, SectionCard } from "@/components/dashboard-kit";
import {
  ChatText,
  Eye,
  Flag,
  Lock,
  PencilSimple,
  Robot,
  type IconComponent,
} from "@/components/icons";
import { LocalDateTime } from "@/components/public/local-datetime";
import { ReviewPanel } from "@/components/review/review-panel";
import { AnswerSummary } from "@/components/submission/answer-summary";
import { requireUser } from "@/lib/auth";
import { getSubmissionForReview, resolveStatus } from "@/lib/forms";
import { getReviewScope } from "@/lib/guild";
import { cn } from "@/lib/utils";
import { dotColors } from "@/lib/color-dot";
import { getDict } from "@/i18n";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EVENT_ICON: Record<string, IconComponent> = {
  status_change: Flag,
  note: PencilSimple,
  message: ChatText,
};

export default async function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ guildId: string; id: string }>;
}) {
  const { guildId, id } = await params;
  const user = await requireUser(`/dashboard/${guildId}/submissions/${id}`);
  const dict = await getDict();
  const t = dict.review;

  const submission = await getSubmissionForReview(id, guildId, dict.statusLabels);
  if (!submission) notFound();

  // Reviewers may only open submissions of forms they're allowed to review.
  const scope = await getReviewScope(guildId, user.id);
  const canReview = scope.all || scope.formIds.includes(submission.formId);
  if (!canReview) notFound();
  const status = resolveStatus(submission.status, submission.statusDefs, dict.statusLabels);
  const answers = (submission.answers ?? {}) as Record<string, unknown>;
  const username = submission.user?.username ?? null;
  const applicant = username ?? t.anonymous;

  // Resolve the per-status message template (form override -> guild) so the
  // review panel can prefill the applicant message when a status is picked.
  const [guildCfg, formCfg] = await Promise.all([
    prisma.guild.findUnique({ where: { id: guildId }, select: { statusMessages: true } }),
    prisma.form.findUnique({ where: { id: submission.formId }, select: { settings: true } }),
  ]);
  const guildMsgs = parseStatusMessages(guildCfg?.statusMessages);
  const formMsgs = parseStatusMessages(
    (formCfg?.settings as { statusMessages?: unknown } | null)?.statusMessages,
  );
  const statusMessages: Record<string, string> = {};
  for (const opt of submission.options) {
    const msg = resolveStatusMessage(guildMsgs, formMsgs, opt.key);
    if (msg) statusMessages[opt.key] = msg;
  }

  const events = submission.events;

  return (
    <>
      <PageHeader
        title={
          <span className="inline-flex items-center gap-3">
            {submission.user?.avatar && (
              <img
                src={submission.user.avatar}
                alt=""
                width={40}
                height={40}
                className="h-10 w-10 shrink-0 rounded-full"
              />
            )}
            <span translate={username ? "no" : undefined} className="break-words">
              {applicant}
            </span>
          </span>
        }
        badge={<SubmissionStatusBadge label={status.label} {...dotColors(status.color)} />}
        breadcrumbs={[
          { label: dict.dashboard.submissionsTab, href: `/dashboard/${guildId}/submissions` },
          { label: <span translate={username ? "no" : undefined}>{applicant}</span> },
        ]}
        breadcrumbLabel={dict.kit.breadcrumb}
        description={
          <dl className="flex flex-wrap gap-x-8 gap-y-3 pt-1">
            <div className="grid gap-0.5">
              <dt className="text-label font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                {dict.dashboard.colForm}
              </dt>
              <dd translate="no" className="font-semibold text-foreground">
                {submission.form.title}
              </dd>
            </div>
            <div className="grid gap-0.5">
              <dt className="text-label font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                {t.submitted}
              </dt>
              <dd className="text-foreground tabular-nums">
                <LocalDateTime iso={submission.submittedAt.toISOString()} />
              </dd>
            </div>
            {submission.score != null && (
              <div className="grid gap-0.5">
                <dt className="text-label font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                  {dict.dashboard.colScore}
                </dt>
                <dd className="font-semibold text-foreground tabular-nums">{submission.score}</dd>
              </div>
            )}
          </dl>
        }
      />

      {/* Answers and review side by side where the content column has room,
          stacked on narrow screens with the answers first. */}
      <div className="grid items-start gap-6 @4xl:grid-cols-[minmax(0,1fr)_minmax(20rem,26rem)]">
        {submission.spec && (
          <SectionCard title={t.answers} bodyClassName="py-1">
            <div className="max-w-[65ch]">
              <AnswerSummary
                spec={submission.spec}
                answers={answers}
                labels={{
                  notAnswered: dict.status.notAnswered,
                  yes: dict.status.yes,
                  no: dict.status.no,
                }}
                files={submission.files}
              />
            </div>
          </SectionCard>
        )}

        <div className="grid gap-6">
          {canReview ? (
            <ReviewPanel
              guildId={guildId}
              submissionId={submission.id}
              currentStatus={submission.status}
              options={submission.options}
              statusMessages={statusMessages}
              t={t}
              dismissLabel={dict.kit.dismiss}
            />
          ) : (
            <EmptyState kind="unavailable" title={t.noPermReview} />
          )}

          <SectionCard title={t.timeline}>
            {events.length === 0 ? (
              <p className="text-muted-foreground">{t.noEvents}</p>
            ) : (
              <ol className="grid">
                {events.map((ev, i) => {
                  const internal = ev.visibility === "internal";
                  const actor = ev.actor?.username ?? null;
                  const Icon = EVENT_ICON[ev.type] ?? Flag;
                  const verb =
                    ev.type === "status_change"
                      ? `${t.statusChanged} ${t.to} “${resolveStatus(ev.toStatus ?? "", submission.statusDefs, dict.statusLabels).label}”`
                      : ev.type === "note"
                        ? t.noteAdded
                        : t.messageSent;
                  return (
                    <li
                      key={ev.id}
                      className="relative grid grid-cols-[2rem_minmax(0,1fr)] gap-x-3 pb-5 last:pb-0"
                    >
                      {/* The line between two events. */}
                      {i < events.length - 1 && (
                        <span
                          aria-hidden
                          className="absolute top-9 bottom-0 left-4 w-px bg-border"
                        />
                      )}
                      <span
                        aria-hidden
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-muted text-muted-foreground"
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="grid min-w-0 gap-1.5">
                        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-small text-muted-foreground">
                          <span className="tabular-nums">
                            <LocalDateTime iso={ev.createdAt.toISOString()} />
                          </span>
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 rounded-sm px-1.5 font-semibold",
                              internal
                                ? "bg-muted text-muted-foreground"
                                : "bg-accent-soft text-primary",
                            )}
                          >
                            {internal ? <Lock className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            {internal ? t.internal : t.public}
                          </span>
                        </p>
                        <p className="break-words">
                          {actor ? (
                            <span translate="no" className="font-semibold">
                              {actor}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 font-semibold">
                              <Robot className="h-4 w-4" />
                              {t.system}
                            </span>
                          )}{" "}
                          {verb}
                        </p>
                        {ev.message && (
                          <p className="rounded-md bg-muted px-3 py-2 text-small break-words whitespace-pre-wrap">
                            {ev.message}
                          </p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </SectionCard>
        </div>
      </div>
    </>
  );
}
