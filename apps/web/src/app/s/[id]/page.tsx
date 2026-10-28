import { DEFAULT_STATUSES } from "@msk-forms/shared";
import { SubmissionStatusBadge } from "@msk-forms/ui";
import { notFound } from "next/navigation";

import { LocalDateTime } from "@/components/public/local-datetime";
import { PublicHead, PublicSection } from "@/components/public/public-content";
import { PublicFrame } from "@/components/public/public-frame";
import { AnswerSummary } from "@/components/submission/answer-summary";
import { StatusLive } from "@/components/submission/status-live";
import { SubmissionActions } from "@/components/submission/submission-actions";
import { parseBranding } from "@/lib/branding";
import { getGuildByDomain, isPrimaryHostname, requestHostname } from "@/lib/custom-domain";
import { getSubmissionForStatus, resolveStatus } from "@/lib/forms";
import { isGuildPro } from "@/lib/plan";
import { dotColors } from "@/lib/color-dot";
import { getDict } from "@/i18n";

const TERMINAL = new Set<string>(DEFAULT_STATUSES.filter((s) => s.terminal).map((s) => s.key));

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * The applicant's status page: where the submission stands, what happened
 * (status changes and the guild's messages), the answers, and the
 * applicant's own data. It refreshes itself when a reviewer acts.
 */
export default async function SubmissionStatusPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const submission = await getSubmissionForStatus(id);
  if (!submission) notFound();

  // On a custom domain, only serve submissions owned by that domain's guild.
  const host = await requestHostname();
  const onCustomDomain = Boolean(host) && !isPrimaryHostname(host!);
  if (onCustomDomain) {
    const domainGuild = await getGuildByDomain(host!);
    if (!domainGuild || domainGuild.id !== submission.form.guildId) notFound();
  }

  const dict = await getDict();
  const t = dict.status;
  // Show the last status the reviewer made visible, not necessarily the raw
  // current status: a reviewer can mark a status change "hidden" (an internal
  // event, no DM), and it must not surface here. Fall back to the stored status
  // for legacy submissions with no public status_change event.
  const lastVisibleStatus =
    [...submission.events].reverse().find((e) => e.type === "status_change" && e.toStatus)
      ?.toStatus ?? submission.status;
  const status = resolveStatus(lastVisibleStatus, submission.statusDefs, dict.statusLabels);
  const answers = (submission.answers ?? {}) as Record<string, unknown>;
  const branding = parseBranding(submission.form.guild.branding);
  const poweredBy = !(await isGuildPro(submission.form.guildId));

  return (
    <PublicFrame
      guild={{ id: submission.form.guildId, name: submission.form.guild.name, branding }}
      hubHref={onCustomDomain ? "/" : `/g/${submission.form.guildId}`}
      returnTo={`/s/${submission.id}`}
      poweredBy={poweredBy}
    >
      <StatusLive submissionId={submission.id} />
      <PublicHead kicker={t.yourSubmission} title={submission.form.title}>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          {/* Announced when the page refreshes itself after a reviewer acts. */}
          <div role="status" aria-live="polite">
            <SubmissionStatusBadge label={status.label} {...dotColors(status.color)} />
          </div>
          <span className="text-small text-muted-foreground">
            {t.submitted} <LocalDateTime iso={submission.submittedAt.toISOString()} />
          </span>
        </div>
      </PublicHead>

      {submission.events.length > 0 && (
        <PublicSection id="activity-title" title={t.activity}>
          <ol className="grid gap-4">
            {submission.events.map((ev) => (
              <li key={ev.id} className="grid gap-1 border-s-[3px] border-primary ps-4">
                <span className="text-small text-muted-foreground">
                  <LocalDateTime iso={ev.createdAt.toISOString()} />
                </span>
                <span className="whitespace-pre-line text-foreground">
                  {ev.type === "status_change" && ev.toStatus
                    ? `${t.statusChangedTo} “${resolveStatus(ev.toStatus, submission.statusDefs, dict.statusLabels).label}”`
                    : (ev.message ?? t.update)}
                </span>
              </li>
            ))}
          </ol>
        </PublicSection>
      )}

      {submission.spec && (
        <PublicSection id="answers-title" title={t.yourAnswers}>
          <AnswerSummary
            spec={submission.spec}
            answers={answers}
            labels={{ notAnswered: t.notAnswered, yes: t.yes, no: t.no }}
            files={submission.files}
          />
        </PublicSection>
      )}

      <PublicSection id="data-title" title={t.yourData}>
        <SubmissionActions
          id={submission.id}
          canWithdraw={!TERMINAL.has(submission.status)}
          t={{
            yourData: t.yourData,
            withdraw: t.withdraw,
            withdrawConfirm: t.withdrawConfirm,
            exportData: t.exportData,
            deleteData: t.deleteData,
            deleteConfirm: t.deleteConfirm,
            deleted: t.deleted,
            actionFailed: t.actionFailed,
            cancel: t.cancel,
          }}
        />
      </PublicSection>
    </PublicFrame>
  );
}
