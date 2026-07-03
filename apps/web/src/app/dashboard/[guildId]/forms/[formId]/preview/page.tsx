import { prisma } from "@msk-forms/db";
import { Card } from "@msk-forms/ui";
import type { Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CustomCss } from "@/components/branding/custom-css";
import { FormRenderer } from "@/components/form/form-renderer";
import { requireUser } from "@/lib/auth";
import { brandStyle, logoUrl, parseBranding } from "@/lib/branding";
import { getFormForEdit, parseFormSpec } from "@/lib/forms";
import { canManageForms } from "@/lib/guild";
import { getDict } from "@/i18n";

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
  const t = dict.form;

  if (!(await canManageForms(guildId, user.id))) {
    return (
      <Card className="p-8">
        <p className="text-muted-foreground">{dict.dashboard.noPermEdit}</p>
      </Card>
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
  const brand = brandStyle(branding);
  const logo = logoUrl(guildId, branding);

  return (
    <main className="msk-form mx-auto flex max-w-2xl flex-col gap-6" style={brand}>
      <CustomCss css={branding.customCss} />

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-primary/30 bg-primary/5 px-3 py-2">
        <span className="flex items-center gap-2 text-sm font-medium text-primary">
          <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-primary-foreground">
            {dict.dashboard.preview}
          </span>
          {dict.dashboard.previewNotice}
        </span>
        <Link
          href={`/dashboard/${guildId}/forms` as Route}
          className="text-sm font-medium text-primary hover:underline"
        >
          {dict.dashboard.previewExit} →
        </Link>
      </div>

      <header className="flex flex-col gap-1">
        {logo && <img src={logo} alt="" className="mb-2 h-12 w-auto self-start" />}
        {guild?.name && (
          <span translate="no" className="text-sm font-medium text-primary">
            {guild.name}
          </span>
        )}
        <h1 className="font-heading text-3xl font-bold text-foreground">{form.title}</h1>
        {form.description && <p className="text-muted-foreground">{form.description}</p>}
      </header>

      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <FormRenderer
          slug={form.slug}
          spec={spec}
          preview
          labels={{
            submit: t.submit,
            submitting: t.submitting,
            required: t.required,
            submitFailed: t.submitFailed,
            captchaRequired: t.captchaRequired,
            fileUploading: t.fileUploading,
            fileRemove: t.fileRemove,
            uploadFailed: t.uploadFailed,
            signatureClear: t.signatureClear,
            next: t.next,
            back: t.back,
            step: t.step,
            dateToday: t.dateToday,
            dateClear: t.dateClear,
            dateNow: t.dateNow,
            previewNote: t.previewNote,
          }}
        />
      </div>
    </main>
  );
}
