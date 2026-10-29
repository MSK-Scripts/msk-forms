import { cookies, headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import Script from "next/script";

import {
  experimentActive,
  formScheduleStatus,
  parseFormSettings,
  pickVariant,
  singleSubmissionEnforced,
} from "@msk-forms/shared";

import { FormRenderer } from "@/components/form/form-renderer";
import { formLabels } from "@/components/form/form-labels";
import { Clock, HourglassMedium, Lock } from "@/components/icons";
import { DiscordMark } from "@/components/icons/brand-marks";
import { Countdown } from "@/components/public/countdown";
import { ExperimentView } from "@/components/public/experiment-view";
import { LocalDateTime } from "@/components/public/local-datetime";
import { PublicCard, PublicHead } from "@/components/public/public-content";
import { PublicFrame } from "@/components/public/public-frame";
import { Button } from "@/components/ui/button";
import { experimentCookieName } from "@/lib/experiment";
import { getCurrentUser } from "@/lib/auth";
import { parseBranding } from "@/lib/branding";
import { getGuildCaptchaSiteKey } from "@/lib/guild-captcha";
import { getGuildByDomain, isPrimaryHostname, requestHostname } from "@/lib/custom-domain";
import { isGuildPro } from "@/lib/plan";
import { captchaSiteKey } from "@/lib/captcha";
import { findActiveSubmissionId, getLiveFormBySlug } from "@/lib/forms";
import { getDict, getLocale } from "@/i18n";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function PublicFormPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const form = await getLiveFormBySlug(slug);
  const dict = await getDict();
  const t = dict.form;

  if (!form || !form.spec) notFound();

  // On a custom domain, only serve forms owned by the guild that owns the domain.
  const host = await requestHostname();
  const onCustomDomain = Boolean(host) && !isPrimaryHostname(host!);
  if (onCustomDomain) {
    const domainGuild = await getGuildByDomain(host!);
    if (!domainGuild || domainGuild.id !== form.guildId) notFound();
  }
  // Same-origin login link for both hosts. The login route is host-aware: on a
  // custom domain whose guild has its own Discord OAuth app it runs the whole
  // flow here (session set on this domain); otherwise it falls back to the
  // primary host.
  const loginHref = `/api/auth/discord/login?returnTo=${encodeURIComponent(`/f/${slug}`)}`;

  const branding = parseBranding(form.guild.branding);
  const poweredBy = !(await isGuildPro(form.guildId));

  /** The guild's frame around the form's heading and its card. */
  const page = (
    title: string,
    description: string | null | undefined,
    body: React.ReactNode,
    before?: React.ReactNode,
  ) => (
    <PublicFrame
      guild={{ id: form.guildId, name: form.guild.name, branding }}
      hubHref={onCustomDomain ? "/" : `/g/${form.guildId}`}
      returnTo={`/f/${slug}`}
      poweredBy={poweredBy}
    >
      <PublicHead title={title} description={description} />
      {before}
      <PublicCard>{body}</PublicCard>
    </PublicFrame>
  );

  const message = (text: string) => (
    <p className="flex items-start gap-3 text-lead">
      <Lock className="mt-1 h-5 w-5 shrink-0 text-muted-foreground" />
      {text}
    </p>
  );

  if (form.status !== "live") return page(form.title, null, message(t.notAccepting));

  // One active submission per person: a signed-in applicant who already has an
  // open (non-terminal) submission for this form is sent to its status page
  // rather than the form. Only enforceable for signed-in applicants, since
  // anonymous submits can't be tied to a person. Once a reviewer sets a
  // terminal status they may apply again.
  const user = await getCurrentUser();
  if (user && singleSubmissionEnforced(parseFormSettings(form.settings))) {
    const activeId = await findActiveSubmissionId(form.id, user.id, form.guildId);
    if (activeId) redirect(`/s/${activeId}`);
  }

  // Scheduling: a live form may not be open yet, or may already have closed.
  const schedule = formScheduleStatus(form.openAt, form.closeAt, new Date());
  if (schedule.state === "scheduled") {
    const showCountdown = parseFormSettings(form.settings).showCountdown === true;
    const opens = (
      <p className="flex flex-wrap items-center gap-x-2 text-muted-foreground">
        <Clock className="h-5 w-5 shrink-0" />
        {t.opensAt} <LocalDateTime iso={form.openAt!.toISOString()} />
      </p>
    );
    return page(
      form.title,
      form.description,
      showCountdown ? (
        <div className="grid gap-5">
          <Countdown
            targetIso={form.openAt!.toISOString()}
            label={t.opensIn}
            units={dict.publicForm}
            celebrate
          />
          {opens}
        </div>
      ) : (
        opens
      ),
    );
  }
  if (schedule.state === "closed") return page(form.title, null, message(t.closedAt));

  if (form.visibility === "authenticated" && !user) {
    return page(
      form.title,
      form.description,
      <div className="grid justify-items-start gap-5">
        <p className="text-lead">{t.needLogin}</p>
        <Button asChild size="lg">
          <a href={loginHref}>
            <DiscordMark className="h-5 w-5" />
            {t.loginDiscord}
          </a>
        </Button>
      </div>,
    );
  }

  if (form.visibility === "password" || form.visibility === "role_required") {
    return page(form.title, null, message(t.accessRestricted));
  }

  // The global Turnstile sitekey is bound to the primary host's allowlist, so it
  // can't render on customer custom domains. There we use the guild's OWN
  // Turnstile site key if configured; otherwise no widget (rate limit only).
  const siteKey = onCustomDomain ? await getGuildCaptchaSiteKey(form.guildId) : captchaSiteKey();
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  // A/B test: assign a variant (sticky cookie, else weighted-random) and show
  // its copy. The variant is tracked client-side (view) and sent with the
  // submission (conversion). Inactive experiment: the form's own copy.
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

  // When the form closes, said in words and with a sign; the guild's colour
  // marks it when the end is near, no status colour on the guild's page.
  const closes = form.closeAt ? (
    schedule.endingSoon ? (
      <p className="flex flex-wrap items-center gap-x-2 rounded-md bg-accent-soft px-4 py-3 font-semibold text-primary">
        <HourglassMedium className="h-5 w-5 shrink-0" weight="bold" />
        {t.endingSoon} <LocalDateTime iso={form.closeAt.toISOString()} />
      </p>
    ) : (
      <p className="flex flex-wrap items-center gap-x-2 text-muted-foreground">
        <Clock className="h-5 w-5 shrink-0" />
        {t.closesAt} <LocalDateTime iso={form.closeAt.toISOString()} />
      </p>
    )
  ) : null;

  return page(
    title,
    description,
    <>
      {variantId && <ExperimentView slug={form.slug} variant={variantId} />}
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
        experimentVariant={variantId ?? undefined}
        labels={formLabels(dict, await getLocale())}
      />
    </>,
    closes,
  );
}
