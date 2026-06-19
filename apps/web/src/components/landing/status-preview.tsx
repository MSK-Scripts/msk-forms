import { StatusBadge } from "@msk-forms/ui";
import { IconCheck, IconClock, IconSend } from "@tabler/icons-react";

/**
 * Hero visual: a faithful miniature of the real applicant status card (the
 * product's feedback-loop USP), composed from the actual design tokens and the
 * real StatusBadge component. Not a stock photo, not a fake-div screenshot.
 */
export function StatusPreview() {
  return (
    <div className="relative">
      <div
        aria-hidden
        className="absolute -inset-10 -z-10 rounded-full bg-accent/15 blur-3xl"
      />
      <div className="rounded-lg border border-border bg-bg-panel p-6 shadow-panel">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-widest text-text-muted">
              Your submission
            </p>
            <p className="mt-1 font-heading text-lg font-bold text-text-primary">
              Whitelist application
            </p>
          </div>
          <StatusBadge label="In review" color="#00E676" />
        </div>

        <div className="mt-6 flex flex-col gap-4">
          <TimelineRow icon={<IconSend size={14} stroke={1.75} />} label="Submitted" time="Jun 18" done />
          <TimelineRow icon={<IconClock size={14} stroke={1.75} />} label="Picked up by a reviewer" time="Jun 19" done />
          <TimelineRow icon={<IconCheck size={14} stroke={1.75} />} label="Decision" time="pending" />
        </div>

        <div className="mt-6 border-t border-border pt-4">
          <p className="font-mono text-[11px] uppercase tracking-widest text-text-muted">
            Reviewer note
          </p>
          <p className="mt-1.5 text-sm text-text-secondary">
            Looks solid. Confirming your in-game name, then you&apos;re in.
          </p>
        </div>
      </div>
    </div>
  );
}

function TimelineRow({
  icon,
  label,
  time,
  done,
}: {
  icon: React.ReactNode;
  label: string;
  time: string;
  done?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${
          done
            ? "border-border-accent bg-accent/10 text-accent"
            : "border-border bg-bg-input text-text-muted"
        }`}
      >
        {icon}
      </span>
      <span className="flex-1 text-sm text-text-primary">{label}</span>
      <span className="font-mono text-[11px] text-text-muted">{time}</span>
    </div>
  );
}
