import { IconArrowRight, IconBrandDiscord } from "@tabler/icons-react";

import { StatusPreview } from "@/components/landing/status-preview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getDict } from "@/i18n";

export async function Hero({
  loggedIn,
  botInvite,
}: {
  loggedIn: boolean;
  botInvite: string;
}) {
  const t = await getDict();

  return (
    <section className="relative overflow-hidden">
      <div className="container grid items-center gap-12 pb-20 pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:pb-28 lg:pt-24">
        <div>
          <Badge variant="outline" className="gap-1.5 border-primary/30 text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            {t.hero.badge}
          </Badge>

          <h1 className="mt-6 max-w-xl text-balance font-heading text-4xl font-bold leading-[1.08] tracking-tight md:text-5xl lg:text-6xl">
            {t.hero.headPre}
            <span className="text-primary">{t.hero.headAccent}</span>
            {t.hero.headPost}
          </h1>

          <p className="mt-6 max-w-lg text-pretty text-lg leading-relaxed text-muted-foreground">
            {t.hero.sub}
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            {loggedIn ? (
              <Button asChild size="lg">
                <a href="/dashboard">
                  {t.hero.openDashboard}
                  <IconArrowRight size={16} stroke={2} />
                </a>
              </Button>
            ) : (
              <Button asChild size="lg">
                <a href="/api/auth/discord/login">
                  <IconBrandDiscord size={16} stroke={1.75} />
                  {t.hero.loginDiscord}
                </a>
              </Button>
            )}
            <Button asChild variant="outline" size="lg">
              <a href="/f/demo-whitelist">{t.hero.demo}</a>
            </Button>
            <Button asChild variant="ghost" size="lg">
              <a href={botInvite} target="_blank" rel="noopener noreferrer">
                <IconBrandDiscord size={16} stroke={1.75} />
                {t.hero.inviteBot}
              </a>
            </Button>
          </div>
        </div>

        <div className="relative">
          <div
            aria-hidden
            className="absolute -inset-6 -z-10 rounded-full bg-primary/10 blur-3xl"
          />
          <StatusPreview />
        </div>
      </div>
    </section>
  );
}
