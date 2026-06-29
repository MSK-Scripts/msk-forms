import { notFound } from "next/navigation";

import { CtaBand } from "@/components/landing/cta";
import { FeatureGrid } from "@/components/landing/feature-grid";
import { Features } from "@/components/landing/features";
import { Hero } from "@/components/landing/hero";
import { Steps } from "@/components/landing/steps";
import { GuildFormsHub } from "@/components/public/forms-hub";
import { getCurrentUser } from "@/lib/auth";
import { getGuildByDomain, isPrimaryHostname, requestHostname } from "@/lib/custom-domain";
import { getGuildCategories, getLiveFormsForGuild } from "@/lib/forms";
import { botInviteUrl } from "@/lib/url";
import { getDict } from "@/i18n";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ auth?: string }>;
}) {
  const t = await getDict();

  // On a guild's custom domain, the root shows that guild's branded form index.
  const host = await requestHostname();
  if (host && !isPrimaryHostname(host)) {
    const guild = await getGuildByDomain(host);
    if (!guild) notFound();
    const [forms, categories] = await Promise.all([
      getLiveFormsForGuild(guild.id),
      getGuildCategories(guild.id),
    ]);
    return (
      <GuildFormsHub
        guild={guild}
        forms={forms}
        categories={categories}
        labels={{
          chooseForm: t.domainHome.chooseForm,
          noForms: t.domainHome.noForms,
          endingSoon: t.form.endingSoon,
          opensAt: t.form.opensAt,
          otherForms: t.domainHome.otherForms,
        }}
      />
    );
  }

  const user = await getCurrentUser();
  const { auth } = await searchParams;
  const botInvite = botInviteUrl();

  return (
    <>
      {auth === "error" && (
        <div className="container pt-4">
          <p className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm text-destructive">
            {t.authError}
          </p>
        </div>
      )}

      <Hero loggedIn={Boolean(user)} botInvite={botInvite} />
      <Features />
      <FeatureGrid />
      <Steps />
      <CtaBand loggedIn={Boolean(user)} botInvite={botInvite} />
    </>
  );
}
