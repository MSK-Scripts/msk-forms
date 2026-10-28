import { formScheduleStatus } from "@msk-forms/shared";

import { ArrowRight, Clock, HourglassMedium, Tray } from "@/components/icons";
import { Countdown, type CountdownUnits } from "@/components/public/countdown";
import { LocalDateTime } from "@/components/public/local-datetime";
import { PublicHead } from "@/components/public/public-content";
import { PublicFrame } from "@/components/public/public-frame";
import { parseBranding } from "@/lib/branding";

export interface HubForm {
  slug: string;
  title: string;
  description: string | null;
  openAt: Date | null;
  closeAt: Date | null;
  categoryId: string | null;
  /** Tease this scheduled form with a live countdown on the hub. */
  showCountdown: boolean;
}

export interface HubCategory {
  id: string;
  name: string;
  color: string | null;
}

export interface HubGuild {
  id: string;
  name: string;
  branding: unknown;
}

export interface HubLabels {
  chooseForm: string;
  noForms: string;
  endingSoon: string;
  opensAt: string;
  opensIn: string;
  otherForms: string;
  units: CountdownUnits;
}

/**
 * Public branded index of a guild's live forms, grouped by category. Shared by
 * the custom-domain landing, `/g/[guildId]` and `/[handle]`. Forms whose
 * window has already closed are dropped; when the guild defines no categories
 * the list renders flat (no headings) to preserve prior behaviour. Each form
 * is a card, because it is clicked.
 */
export function GuildFormsHub({
  guild,
  forms,
  categories,
  labels,
  path,
}: {
  guild: HubGuild;
  forms: HubForm[];
  categories: HubCategory[];
  labels: HubLabels;
  /** The address of this index on the current host. */
  path: string;
}) {
  const branding = parseBranding(guild.branding);
  const now = new Date();

  // Keep open + scheduled forms, drop already-closed ones.
  const visible = forms
    .map((form) => ({ form, schedule: formScheduleStatus(form.openAt, form.closeAt, now) }))
    .filter(({ schedule }) => schedule.state !== "closed");

  type Group = { key: string; title: string | null; color: string | null; items: typeof visible };
  const groups: Group[] = [];
  if (categories.length > 0) {
    for (const cat of categories) {
      const items = visible.filter(({ form }) => form.categoryId === cat.id);
      if (items.length) groups.push({ key: cat.id, title: cat.name, color: cat.color, items });
    }
    const known = new Set(categories.map((c) => c.id));
    const other = visible.filter(({ form }) => !form.categoryId || !known.has(form.categoryId));
    if (other.length) groups.push({ key: "__other", title: labels.otherForms, color: null, items: other });
  } else {
    groups.push({ key: "__all", title: null, color: null, items: visible });
  }

  return (
    <PublicFrame guild={{ id: guild.id, name: guild.name, branding }} hubHref={path} returnTo={path}>
      <PublicHead title={guild.name} />

      {visible.length === 0 ? (
        <p className="flex items-center gap-3 text-lead text-muted-foreground">
          <Tray className="h-6 w-6 shrink-0" />
          {labels.noForms}
        </p>
      ) : (
        groups.map((group) => (
          <section
            key={group.key}
            aria-labelledby={group.title ? `group-${group.key}` : undefined}
            className="grid gap-3"
          >
            {group.title && (
              <h2 id={`group-${group.key}`} className="flex items-center gap-2.5 font-display text-lead font-[650]">
                {group.color && (
                  // The guild's own category colour, beside the name and never alone.
                  <span aria-hidden className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: group.color }} />
                )}
                {group.title}
              </h2>
            )}
            <ul className="grid gap-3">
              {group.items.map(({ form, schedule }) => (
                <li key={form.slug}>
                  <a
                    href={`/f/${form.slug}`}
                    className="group grid gap-2 rounded-lg border border-border bg-card p-[clamp(1.125rem,0.875rem+1vw,1.75rem)] text-card-foreground shadow-[var(--shadow-card)] transition-[border-color,box-shadow] duration-150 hover:border-primary hover:shadow-[var(--shadow-card-hover)]"
                  >
                    <span className="font-display text-h3 font-[650] text-balance">{form.title}</span>
                    {schedule.endingSoon && (
                      <span className="inline-flex items-center gap-1.5 justify-self-start rounded-sm bg-accent-soft px-2.5 py-1 text-small font-semibold text-primary">
                        <HourglassMedium className="h-4 w-4" weight="bold" />
                        {labels.endingSoon}
                      </span>
                    )}
                    {form.description && (
                      <span className="max-w-[60ch] whitespace-pre-line text-muted-foreground">{form.description}</span>
                    )}
                    {schedule.state === "scheduled" && form.openAt ? (
                      <div className="mt-1 grid gap-2">
                        {form.showCountdown && (
                          <Countdown targetIso={form.openAt.toISOString()} label={labels.opensIn} units={labels.units} size="sm" />
                        )}
                        <span className="flex flex-wrap items-center gap-x-2 text-small text-muted-foreground">
                          <Clock className="h-4 w-4 shrink-0" />
                          {labels.opensAt} <LocalDateTime iso={form.openAt.toISOString()} />
                        </span>
                      </div>
                    ) : (
                      <span className="mt-1 inline-flex items-center gap-1.5 font-semibold text-primary">
                        {labels.chooseForm}
                        <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-[3px]" />
                      </span>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </PublicFrame>
  );
}
