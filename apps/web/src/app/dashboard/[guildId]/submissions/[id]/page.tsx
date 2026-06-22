import type { Route } from "next";
import { StatusBadge } from "@msk-forms/ui";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AnswerSummary } from "@/components/submission/answer-summary";
import { ReviewPanel } from "@/components/review/review-panel";
import { requireUser } from "@/lib/auth";
import { getSubmissionForReview, resolveStatus } from "@/lib/forms";
import { getReviewScope } from "@/lib/guild";
import { getDict } from "@/i18n";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function fmt(date: Date): string {
  return date.toISOString().slice(0, 16).replace("T", " ");
}

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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Link
          href={`/dashboard/${guildId}/submissions` as Route}
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          ← {t.back}
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-heading text-2xl font-bold text-foreground">
            {submission.form.title}
          </h1>
          <StatusBadge label={status.label} color={status.color} />
          {submission.score != null && (
            <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
              {dict.dashboard.colScore}: {submission.score}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {submission.user?.avatar && (
            <img src={submission.user.avatar} alt="" width={20} height={20} className="rounded-full" />
          )}
          <span>{submission.user?.username ?? t.anonymous}</span>
          <span>·</span>
          <span className="font-mono text-xs">
            {t.submitted} {submission.submittedAt.toISOString().slice(0, 10)}
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="flex flex-col gap-6">
          {submission.spec && (
            <section className="rounded-lg border border-border bg-card p-6 shadow-sm">
              <h2 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t.answers}
              </h2>
              <AnswerSummary
                spec={submission.spec}
                answers={answers}
                labels={{ notAnswered: dict.status.notAnswered, yes: dict.status.yes, no: dict.status.no }}
                files={submission.files}
              />
            </section>
          )}

          <section className="rounded-lg border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t.timeline}
            </h2>
            {submission.events.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t.noEvents}</p>
            ) : (
              <ol className="flex flex-col gap-4">
                {submission.events.map((ev) => {
                  const internal = ev.visibility === "internal";
                  const actor = ev.actor?.username ?? t.system;
                  const verb =
                    ev.type === "status_change"
                      ? `${t.statusChanged} ${t.to} “${resolveStatus(ev.toStatus ?? "", submission.statusDefs, dict.statusLabels).label}”`
                      : ev.type === "note"
                        ? t.noteAdded
                        : t.messageSent;
                  return (
                    <li
                      key={ev.id}
                      className={`flex flex-col gap-1 border-l-2 pl-3 ${internal ? "border-border" : "border-primary"}`}
                    >
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-mono">{fmt(ev.createdAt)}</span>
                        <span
                          className={`rounded-sm px-1.5 py-0.5 font-mono uppercase tracking-wide ${
                            internal ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"
                          }`}
                        >
                          {internal ? t.internal : t.public}
                        </span>
                      </div>
                      <p className="text-sm text-foreground">
                        <span className="font-medium">{actor}</span> {verb}
                      </p>
                      {ev.message && (
                        <p className="whitespace-pre-wrap text-sm text-muted-foreground">{ev.message}</p>
                      )}
                    </li>
                  );
                })}
              </ol>
            )}
          </section>
        </div>

        {canReview ? (
          <ReviewPanel
            guildId={guildId}
            submissionId={submission.id}
            currentStatus={submission.status}
            options={submission.options}
            t={t}
          />
        ) : (
          <aside className="rounded-lg border border-border bg-card p-5 text-sm text-muted-foreground shadow-sm">
            {t.noPermReview}
          </aside>
        )}
      </div>
    </div>
  );
}
