import { formScheduleStatus } from "@msk-forms/shared";
import type { Route } from "next";
import Link from "next/link";

import { CustomCss } from "@/components/branding/custom-css";
import { LocalDateTime } from "@/components/public/local-datetime";
import { brandStyle, logoUrl, parseBranding } from "@/lib/branding";

export interface HubForm {
  slug: string;
  title: string;
  description: string | null;
  openAt: Date | null;
  closeAt: Date | null;
  categoryId: string | null;
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
  otherForms: string;
}

/**
 * Public branded index of a guild's live forms, grouped by category. Shared by
 * the custom-domain landing and the primary-domain hub page (`/g/[guildId]`).
 * Forms whose window has already closed are dropped; when the guild defines no
 * categories the list renders flat (no headings) to preserve prior behavior.
 */
export function GuildFormsHub({
  guild,
  forms,
  categories,
  labels,
}: {
  guild: HubGuild;
  forms: HubForm[];
  categories: HubCategory[];
  labels: HubLabels;
}) {
  const branding = parseBranding(guild.branding);
  const brand = brandStyle(branding);
  const logo = logoUrl(guild.id, branding);
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
    <main className="msk-form mx-auto flex max-w-2xl flex-col gap-6 px-6 py-12" style={brand}>
      <CustomCss css={branding.customCss} />
      <header className="flex flex-col gap-2">
        {logo && <img src={logo} alt="" className="mb-2 h-12 w-auto self-start" />}
        <h1 translate="no" className="font-heading text-3xl font-bold text-foreground">
          {guild.name}
        </h1>
      </header>

      {visible.length === 0 ? (
        <p className="text-sm text-muted-foreground">{labels.noForms}</p>
      ) : (
        groups.map((group) => (
          <section key={group.key} className="flex flex-col gap-3">
            {group.title && (
              <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {group.color && (
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: group.color }}
                  />
                )}
                {group.title}
              </h2>
            )}
            <ul className="flex flex-col gap-3">
              {group.items.map(({ form, schedule }) => (
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
                      <span className="mt-1 text-sm font-medium text-primary">
                        {labels.chooseForm} →
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </main>
  );
}
