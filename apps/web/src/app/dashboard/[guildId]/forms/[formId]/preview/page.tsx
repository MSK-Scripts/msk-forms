import { prisma } from "@msk-forms/db";
import type { Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CustomCss } from "@/components/branding/custom-css";
import { EmptyState, Notice, PageHeader } from "@/components/dashboard-kit";
import { formLabels } from "@/components/form/form-labels";
import { FormRenderer } from "@/components/form/form-renderer";
import { ArrowLeft } from "@/components/icons";
import { PublicCard, PublicHead } from "@/components/public/public-content";
import { Button } from "@/components/ui/button";
import { getDict } from "@/i18n";
import { requireUser } from "@/lib/auth";
import { brandProps, logoUrl, parseBranding } from "@/lib/branding";
import { getFormForEdit, parseFormSpec } from "@/lib/forms";
import { canManageForm } from "@/lib/guild";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Private live preview of a form for guild managers, regardless of its status
 * (e.g. a draft that is not published yet). Renders the exact public form with
 * guild branding, but in preview mode: it validates and navigates without ever
 * submitting. Owner/admin only.
 */
export default async function FormPreviewPage({
  params,
}: {
  params: Promise<{ guildId: string; formId: string }>;
}) {
  const { guildId, formId } = await params;
  const user = await requireUser(`/dashboard/${guildId}/forms/${formId}/preview`);
  const dict = await getDict();
  const t = dict.dashboard;
  const formsHref = `/dashboard/${guildId}/forms`;

  if (!(await canManageForm(guildId, user.id, formId))) {
    return (
      <>
        <PageHeader
          title={t.preview}
          breadcrumbs={[{ label: t.formsTab, href: formsHref }, { label: t.preview }]}
          breadcrumbLabel={dict.kit.breadcrumb}
        />
        <EmptyState kind="unavailable" title={t.noPermEdit} />
      </>
    );
  }

  const form = await getFormForEdit(formId, guildId);
  if (!form) notFound();
  const spec = parseFormSpec(form.schema);
  if (!spec) notFound();

  const guild = await prisma.guild.findUnique({
    where: { id: guildId },
    select: { name: true, branding: true },
  });
  const branding = parseBranding(guild?.branding);
  const brand = brandProps(branding);
  const logo = logoUrl(guildId, branding);

  return (
    <div className="grid gap-[var(--app-gutter-y)]">
      {/* In place of a page head: what this is and the way back. The form's
          own title is the page's heading, as on the public page. */}
      <Notice
        tone="info"
        title={t.preview}
        action={
          <Button asChild variant="outline">
            <Link href={formsHref as Route} prefetch={false}>
              <ArrowLeft className="h-4 w-4" />
              {t.previewExit}
            </Link>
          </Button>
        }
      >
        {t.previewNotice}
      </Notice>

      {/* The form as its public page shows it: the guild's colour and custom
          CSS on the frame, its name in the bar, `.msk-form` on the column. */}
      <div {...brand} className="overflow-hidden rounded-lg border border-border bg-background text-foreground">
        <CustomCss css={branding.customCss} />
        <div className="flex min-h-[var(--header-height)] items-center gap-3 border-b border-border bg-card px-[clamp(1rem,0.8rem+0.6vw,1.5rem)]">
          {logo ? (
            <img src={logo} alt="" className="h-9 w-auto max-w-[7rem] shrink-0 object-contain" />
          ) : guild?.name ? (
            <span
              aria-hidden
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary font-display font-bold text-primary-foreground"
            >
              {guild.name.trim().charAt(0).toUpperCase()}
            </span>
          ) : null}
          {guild?.name && (
            <span translate="no" className="truncate font-display text-lead font-bold">
              {guild.name}
            </span>
          )}
        </div>
        <div className="px-[clamp(1rem,0.8rem+0.6vw,1.5rem)] py-[clamp(2rem,1.25rem+3vw,5rem)]">
          <div className="msk-form mx-auto grid w-full max-w-[var(--public-column)] gap-[var(--space-stack)]">
            <PublicHead title={form.title} description={form.description} />
            <PublicCard>
              <FormRenderer slug={form.slug} spec={spec} preview labels={formLabels(dict)} />
            </PublicCard>
          </div>
        </div>
      </div>
    </div>
  );
}
