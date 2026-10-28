import { notFound } from "next/navigation";

import { Notice } from "@/components/dashboard-kit/notice";
import { CtaBand } from "@/components/landing/cta";
import { FeatureGrid } from "@/components/landing/feature-grid";
import { Features } from "@/components/landing/features";
import { Hero } from "@/components/landing/hero";
import { Steps } from "@/components/landing/steps";
import { GuildHub } from "@/components/public/guild-hub";
import { SiteChrome } from "@/components/site/site-chrome";
import { getCurrentUser } from "@/lib/auth";
import { getGuildByDomain, isPrimaryHostname, requestHostname } from "@/lib/custom-domain";
import { botInviteUrl } from "@/lib/url";
import { getDict } from "@/i18n";

export const dynamic = "force-dynamic";

/**
 * `/` is two pages. On a guild's verified custom domain it is that guild's
 * branded form index, in the public frame and without msk-scripts.de's
 * navigation; everywhere else it is the landing page in the site frame. The
 * host decides, so this page renders its frame itself instead of sitting in
 * the (site) route group.
 */
export default async function HomePage({ searchParams }: { searchParams: Promise<{ auth?: string }> }) {
  // On a guild's custom domain, the root shows that guild's branded form index.
  const host = await requestHostname();
  if (host && !isPrimaryHostname(host)) {
    const guild = await getGuildByDomain(host);
    if (!guild) notFound();
    return <GuildHub guild={guild} />;
  }

  const [t, user, { auth }] = await Promise.all([getDict(), getCurrentUser(), searchParams]);
  const botInvite = botInviteUrl();

  return (
    <SiteChrome>
      {auth === "error" && (
        <div className="container-page pt-6">
          <Notice tone="danger" role="alert" title={t.authError} />
        </div>
      )}
      <Hero loggedIn={Boolean(user)} botInvite={botInvite} />
      <Features />
      <FeatureGrid />
      <Steps />
      <CtaBand loggedIn={Boolean(user)} botInvite={botInvite} />
    </SiteChrome>
  );
}
