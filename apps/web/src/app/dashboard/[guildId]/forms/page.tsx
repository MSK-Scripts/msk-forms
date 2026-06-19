import { Card, StatusBadge } from "@msk-forms/ui";
import type { Route } from "next";
import Link from "next/link";

import { appBaseUrl } from "@/lib/url";
import { getGuildForms } from "@/lib/guild";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FORM_STATUS_COLORS: Record<string, string> = {
  draft: "#6b6b72",
  live: "#00E676",
  closed: "#f5a623",
  archived: "#6b6b72",
};

export default async function GuildFormsPage({
  params,
}: {
  params: Promise<{ guildId: string }>;
}) {
  const { guildId } = await params;
  const forms = await getGuildForms(guildId);
  const base = appBaseUrl();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          {forms.length} {forms.length === 1 ? "form" : "forms"}
        </h2>
        <Link
          href={`/dashboard/${guildId}/forms/new` as Route}
          className="rounded-sm bg-primary px-4 py-2 font-mono text-xs font-bold uppercase tracking-widest text-primary-foreground hover:opacity-90"
        >
          + New form
        </Link>
      </div>

      {forms.length === 0 ? (
        <Card className="p-8">
          <p className="text-muted-foreground">No forms yet. Create your first one.</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {forms.map((form) => (
            <Card key={form.id} className="flex items-center justify-between gap-4 p-4">
              <div className="flex min-w-0 flex-col gap-1">
                <div className="flex items-center gap-3">
                  <span className="truncate font-medium text-foreground">{form.title}</span>
                  <StatusBadge
                    label={form.status}
                    color={FORM_STATUS_COLORS[form.status] ?? "#6b6b72"}
                  />
                </div>
                <span className="font-mono text-xs text-muted-foreground">
                  {form._count.submissions} submissions
                  {form.status === "live" && (
                    <>
                      {" · "}
                      <a
                        href={`${base}/f/${form.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary hover:underline"
                      >
                        /f/{form.slug}
                      </a>
                    </>
                  )}
                </span>
              </div>
              <Link
                href={`/dashboard/${guildId}/forms/${form.id}/edit` as Route}
                className="shrink-0 rounded-sm border border-border px-3 py-1.5 font-mono text-xs uppercase tracking-widest text-muted-foreground hover:border-primary/40 hover:text-foreground"
              >
                Edit
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
