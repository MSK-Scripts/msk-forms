import { headers } from "next/headers";
import { notFound } from "next/navigation";
import Script from "next/script";

import type { CSSProperties } from "react";

import { FormRenderer } from "@/components/form/form-renderer";
import { getCurrentUser } from "@/lib/auth";
import { brandStyle, logoUrl, parseBranding } from "@/lib/branding";
import { captchaSiteKey } from "@/lib/captcha";
import { getLiveFormBySlug } from "@/lib/forms";
import { getDict } from "@/i18n";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function PublicFormPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const form = await getLiveFormBySlug(slug);
  const t = (await getDict()).form;

  if (!form || !form.spec) notFound();

  const branding = parseBranding(form.guild.branding);
  const brand = brandStyle(branding);
  const logo = logoUrl(form.guildId, branding);

  if (form.status !== "live") {
    return (
      <Shell guildName={form.guild.name} title={form.title} style={brand} logoSrc={logo}>
        <p className="text-sm text-muted-foreground">{t.notAccepting}</p>
      </Shell>
    );
  }

  if (form.visibility === "authenticated") {
    const user = await getCurrentUser();
    if (!user) {
      return (
        <Shell guildName={form.guild.name} title={form.title} style={brand} logoSrc={logo}>
          <p className="text-sm text-muted-foreground">{t.needLogin}</p>
          <a
            href={`/api/auth/discord/login?returnTo=/f/${slug}`}
            className="mt-4 inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {t.loginDiscord}
          </a>
        </Shell>
      );
    }
  }

  if (form.visibility === "password" || form.visibility === "role_required") {
    return (
      <Shell guildName={form.guild.name} title={form.title} style={brand} logoSrc={logo}>
        <p className="text-sm text-muted-foreground">{t.accessRestricted}</p>
      </Shell>
    );
  }

  const siteKey = captchaSiteKey();
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <Shell guildName={form.guild.name} title={form.title} description={form.description} style={brand} logoSrc={logo}>
      {siteKey && (
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js"
          strategy="afterInteractive"
          nonce={nonce}
        />
      )}
      <FormRenderer
        slug={form.slug}
        spec={form.spec}
        captchaSiteKey={siteKey}
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
        }}
      />
    </Shell>
  );
}

function Shell({
  guildName,
  title,
  description,
  children,
  style,
  logoSrc,
}: {
  guildName: string;
  title: string;
  description?: string | null;
  children: React.ReactNode;
  style?: CSSProperties;
  logoSrc?: string | null;
}) {
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-12" style={style}>
      <header className="flex flex-col gap-1">
        {logoSrc && <img src={logoSrc} alt="" className="mb-2 h-12 w-auto self-start" />}
        <span className="text-sm font-medium text-primary">{guildName}</span>
        <h1 className="font-heading text-3xl font-bold text-foreground">{title}</h1>
        {description && <p className="text-muted-foreground">{description}</p>}
      </header>
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">{children}</div>
    </main>
  );
}
