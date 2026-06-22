import type { Route } from "next";
import Link from "next/link";

import { CustomCss } from "@/components/branding/custom-css";
import { brandStyle, logoUrl, parseBranding } from "@/lib/branding";
import type { DomainGuild } from "@/lib/custom-domain";

interface DomainForm {
  slug: string;
  title: string;
  description: string | null;
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
  labels: { chooseForm: string; noForms: string };
}) {
  const branding = parseBranding(guild.branding);
  const brand = brandStyle(branding);
  const logo = logoUrl(guild.id, branding);

  return (
    <main className="msk-form mx-auto flex max-w-2xl flex-col gap-6 px-6 py-12" style={brand}>
      <CustomCss css={branding.customCss} />
      <header className="flex flex-col gap-2">
        {logo && <img src={logo} alt="" className="mb-2 h-12 w-auto self-start" />}
        <h1 className="font-heading text-3xl font-bold text-foreground">{guild.name}</h1>
      </header>

      {forms.length === 0 ? (
        <p className="text-sm text-muted-foreground">{labels.noForms}</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {forms.map((form) => (
            <li key={form.slug}>
              <Link
                href={`/f/${form.slug}` as Route}
                className="flex flex-col gap-1 rounded-lg border border-border bg-card p-5 shadow-sm transition-colors hover:border-primary/40"
              >
                <span className="font-heading text-lg font-semibold text-foreground">
                  {form.title}
                </span>
                {form.description && (
                  <span className="text-sm text-muted-foreground">{form.description}</span>
                )}
                <span className="mt-1 text-sm font-medium text-primary">{labels.chooseForm} →</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
