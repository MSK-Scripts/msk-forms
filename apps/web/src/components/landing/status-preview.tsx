import { Check, Clock, PaperPlaneTilt } from "@/components/icons";
import { getDict, getLocale } from "@/i18n";
import { cn } from "@/lib/utils";

/**
 * Hero picture: a miniature of the real applicant status page, the product's
 * status loop, as a figure with a caption that says what it shows. The dates
 * are a fixed example in the visitor's date format, not data.
 */
export async function StatusPreview() {
  const [dict, locale] = await Promise.all([getDict(), getLocale()]);
  const t = dict.preview;
  const day = (d: number) =>
    new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" }).format(new Date(2026, 5, d));

  return (
    <figure className="grid gap-3">
      <div className="mx-auto grid w-full max-w-[30rem] gap-5 rounded-lg border border-border bg-card p-[clamp(1.25rem,1rem+0.8vw,2rem)] text-card-foreground shadow-[var(--shadow-card-hover)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="grid gap-1">
            <span className="text-label font-semibold tracking-[0.08em] text-muted-foreground uppercase">
              {t.submission}
            </span>
            <span className="font-display text-h3 font-[650]">{t.title}</span>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-sm bg-accent-soft px-2.5 py-1 text-small font-semibold text-primary">
            <Clock className="h-4 w-4" weight="bold" />
            {t.inReview}
          </span>
        </div>
        <ol className="grid gap-3.5">
          <Row icon={<PaperPlaneTilt className="h-4 w-4" />} label={t.submitted} time={day(18)} done />
          <Row icon={<Clock className="h-4 w-4" />} label={t.pickedUp} time={day(19)} done />
          <Row icon={<Check className="h-4 w-4" />} label={t.decision} time={t.pending} />
        </ol>
        <div className="grid gap-1 rounded-md bg-muted p-3.5">
          <span className="text-label font-semibold tracking-[0.08em] text-muted-foreground uppercase">
            {t.reviewerNote}
          </span>
          <p className="text-small text-foreground">{t.note}</p>
        </div>
      </div>
      <figcaption className="mx-auto w-full max-w-[30rem] text-small text-band-muted">
        {dict.marketing.previewCaption}
      </figcaption>
    </figure>
  );
}

function Row({ icon, label, time, done }: { icon: React.ReactNode; label: string; time: string; done?: boolean }) {
  return (
    <li className="flex items-center gap-3">
      <span
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border",
          done ? "border-primary bg-accent-soft text-primary" : "border-input text-muted-foreground",
        )}
      >
        {icon}
      </span>
      <span className="flex-1 text-small text-foreground">{label}</span>
      <span className="text-small tabular-nums text-muted-foreground">{time}</span>
    </li>
  );
}
