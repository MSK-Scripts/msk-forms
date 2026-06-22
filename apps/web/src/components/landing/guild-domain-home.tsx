import { formScheduleStatus } from "@msk-forms/shared";
import type { Route } from "next";
import Link from "next/link";

import { CustomCss } from "@/components/branding/custom-css";
import { LocalDateTime } from "@/components/public/local-datetime";
import { brandStyle, logoUrl, parseBranding } from "@/lib/branding";
import type { DomainGuild } from "@/lib/custom-domain";

interface DomainForm {
  slug: string;
  title: string;
  description: string | null;
  openAt: Date | null;
  closeAt: Date | null;
}

/**
 * Public landing shown at the root of a guild's custom domain: the guild's own
 * branding (logo, accent, custom CSS) and a list of its live forms.
 */
export function GuildDomainHome({
  guild,
  forms,
  labels,
}: {
  guild: DomainGuild;
  forms: DomainForm[];
  labels: { chooseForm: string; noForms: string; endingSoon: string; opensAt: string };
}) {
  const branding = parseBranding(guild.branding);
  const brand = brandStyle(branding);
  const logo = logoUrl(guild.id, branding);
  const now = new Date();
  // Drop forms whose window has already closed; keep open + scheduled ones.
  const visible = forms
    .map((form) => ({ form, schedule: formScheduleStatus(form.openAt, form.closeAt, now) }))
    .filter(({ schedule }) => schedule.state !== "closed");

  return (
    <main className="msk-form mx-auto flex max-w-2xl flex-col gap-6 px-6 py-12" style={brand}>
      <CustomCss css={branding.customCss} />
      <header className="flex flex-col gap-2">
        {logo && <img src={logo} alt="" className="mb-2 h-12 w-auto self-start" />}
        <h1 translate="no" className="font-heading text-3xl font-bold text-foreground">{guild.name}</h1>
      </header>

      {visible.length === 0 ? (
        <p className="text-sm text-muted-foreground">{labels.noForms}</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {visible.map(({ form, schedule }) => (
            <li key={form.slug}>
              <Link
                href={`/f/${form.slug}` as Route}
                className="flex flex-col gap-1 rounded-lg border border-border bg-card p-5 shadow-sm transition-colors hover:border-primary/40"
              >
                <span className="flex items-center gap-2 font-heading text-lg font-semibold text-foreground">
                  {form.title}
                  {schedule.endingSoon && (
                    <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                      ⏳ {labels.endingSoon}
                    </span>
                  )}
                </span>
                {form.description && (
                  <span className="text-sm text-muted-foreground">{form.description}</span>
                )}
                {schedule.state === "scheduled" && form.openAt ? (
                  <span className="mt-1 text-sm text-muted-foreground">
                    {labels.opensAt} <LocalDateTime iso={form.openAt.toISOString()} />
                  </span>
                ) : (
                  <span className="mt-1 text-sm font-medium text-primary">{labels.chooseForm} →</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
