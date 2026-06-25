import { cookies, headers } from "next/headers";
import { notFound } from "next/navigation";
import Script from "next/script";

import type { CSSProperties } from "react";

import { experimentActive, formScheduleStatus, parseFormSettings, pickVariant } from "@msk-forms/shared";

import { CustomCss } from "@/components/branding/custom-css";
import { FormRenderer } from "@/components/form/form-renderer";
import { ExperimentView } from "@/components/public/experiment-view";
import { LocalDateTime } from "@/components/public/local-datetime";
import { PoweredBy } from "@/components/public/powered-by";
import { experimentCookieName } from "@/lib/experiment";
import { getCurrentUser } from "@/lib/auth";
import { brandStyle, logoUrl, parseBranding } from "@/lib/branding";
import { getGuildByDomain, isPrimaryHostname, requestHostname } from "@/lib/custom-domain";
import { isGuildPro } from "@/lib/plan";
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

  // On a custom domain, only serve forms owned by the guild that owns the domain.
  const host = await requestHostname();
  const onCustomDomain = Boolean(host) && !isPrimaryHostname(host!);
  if (onCustomDomain) {
    const domainGuild = await getGuildByDomain(host!);
    if (!domainGuild || domainGuild.id !== form.guildId) notFound();
  }
  // Auth must happen on the primary domain (same-origin OAuth state/callback).
  // From a custom domain, /api/auth/start (same origin) sets a host-only binding
  // cookie, then bounces to the primary login; the callback hands the session
  // back here via a browser-bound one-time token.
  const loginHref = onCustomDomain
    ? `/api/auth/start?returnTo=${encodeURIComponent(`/f/${slug}`)}`
    : `/api/auth/discord/login?returnTo=/f/${slug}`;

  const branding = parseBranding(form.guild.branding);
  const brand = brandStyle(branding);
  const logo = logoUrl(form.guildId, branding);
  const badge = (await isGuildPro(form.guildId)) ? null : <PoweredBy label={t.poweredBy} />;

  if (form.status !== "live") {
    return (
      <Shell guildName={form.guild.name} title={form.title} style={brand} logoSrc={logo} customCss={branding.customCss} poweredBy={badge}>
        <p className="text-sm text-muted-foreground">{t.notAccepting}</p>
      </Shell>
    );
  }

  // Scheduling: a live form may not be open yet, or may already have closed.
  const schedule = formScheduleStatus(form.openAt, form.closeAt, new Date());
  if (schedule.state === "scheduled") {
    return (
      <Shell guildName={form.guild.name} title={form.title} style={brand} logoSrc={logo} customCss={branding.customCss} poweredBy={badge}>
        <p className="text-sm text-muted-foreground">
          {t.opensAt} <LocalDateTime iso={form.openAt!.toISOString()} />
        </p>
      </Shell>
    );
  }
  if (schedule.state === "closed") {
    return (
      <Shell guildName={form.guild.name} title={form.title} style={brand} logoSrc={logo} customCss={branding.customCss} poweredBy={badge}>
        <p className="text-sm text-muted-foreground">{t.closedAt}</p>
      </Shell>
    );
  }

  if (form.visibility === "authenticated") {
    const user = await getCurrentUser();
    if (!user) {
      return (
        <Shell guildName={form.guild.name} title={form.title} style={brand} logoSrc={logo} customCss={branding.customCss} poweredBy={badge}>
          <p className="text-sm text-muted-foreground">{t.needLogin}</p>
          <a
            href={loginHref}
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
      <Shell guildName={form.guild.name} title={form.title} style={brand} logoSrc={logo} customCss={branding.customCss} poweredBy={badge}>
        <p className="text-sm text-muted-foreground">{t.accessRestricted}</p>
      </Shell>
    );
  }

  // The global Turnstile sitekey is bound to the primary host's allowlist, so it
  // can't render on customer custom domains. Skip the widget there — those forms
  // stay protected by the per-IP rate limit on submit (see the submit route).
  const siteKey = onCustomDomain ? null : captchaSiteKey();
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  // A/B test: assign a variant (sticky cookie, else weighted-random) and show
  // its copy. The variant is tracked client-side (view) and sent with the
  // submission (conversion). Inactive experiment → the form's own copy.
  const experiment = parseFormSettings(form.settings).experiment;
  let variantId: string | null = null;
  let title = form.title;
  let description = form.description;
  if (experimentActive(experiment)) {
    const cookieVal = (await cookies()).get(experimentCookieName(form.id))?.value;
    variantId = experiment!.variants.some((v) => v.id === cookieVal)
      ? cookieVal!
      : pickVariant(experiment!.variants, Math.random());
    const variant = experiment!.variants.find((v) => v.id === variantId);
    if (variant?.title) title = variant.title;
    if (variant?.description) description = variant.description;
  }

  return (
    <Shell guildName={form.guild.name} title={title} description={description} style={brand} logoSrc={logo} customCss={branding.customCss} poweredBy={badge}>
      {variantId && <ExperimentView slug={form.slug} variant={variantId} />}
      {siteKey && (
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js"
          strategy="afterInteractive"
          nonce={nonce}
        />
      )}
      {form.closeAt && (
        <p
          className={`rounded-md border px-3 py-2 text-sm ${
            schedule.endingSoon
              ? "border-amber-500/40 bg-amber-500/10 font-medium text-amber-600 dark:text-amber-400"
              : "border-border bg-muted/40 text-muted-foreground"
          }`}
        >
          {schedule.endingSoon ? `⏳ ${t.endingSoon} ` : `${t.closesAt} `}
          <LocalDateTime iso={form.closeAt.toISOString()} />
        </p>
      )}
      <FormRenderer
        slug={form.slug}
        spec={form.spec}
        captchaSiteKey={siteKey}
        experimentVariant={variantId ?? undefined}
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
  customCss,
  poweredBy,
}: {
  guildName: string;
  title: string;
  description?: string | null;
  children: React.ReactNode;
  style?: CSSProperties;
  logoSrc?: string | null;
  customCss?: string;
  poweredBy?: React.ReactNode;
}) {
  return (
    <main className="msk-form mx-auto flex max-w-2xl flex-col gap-6 px-6 py-12" style={style}>
      <CustomCss css={customCss} />
      <header className="flex flex-col gap-1">
        {logoSrc && <img src={logoSrc} alt="" className="mb-2 h-12 w-auto self-start" />}
        <span translate="no" className="text-sm font-medium text-primary">{guildName}</span>
        <h1 className="font-heading text-3xl font-bold text-foreground">{title}</h1>
        {description && <p className="text-muted-foreground">{description}</p>}
      </header>
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">{children}</div>
      {poweredBy}
    </main>
  );
}
