import { IconArrowRight, IconBrandDiscord } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getDict } from "@/i18n";

export async function CtaBand({
  loggedIn,
  botInvite,
}: {
  loggedIn: boolean;
  botInvite: string;
}) {
  const t = await getDict();

  return (
    <section className="container py-20 lg:py-28">
      <Card className="relative overflow-hidden border-primary/20 bg-primary/4">
        <div
          aria-hidden
          className="absolute -top-24 left-1/2 h-64 w-xl -translate-x-1/2 rounded-full bg-primary/15 blur-3xl"
        />
        <CardContent className="relative px-8 py-16 text-center">
          <h2 className="mx-auto max-w-2xl text-balance font-heading text-3xl font-bold tracking-tight md:text-4xl">
            {t.cta.title}
          </h2>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            {loggedIn ? (
              <Button asChild size="lg">
                <a href="/dashboard">
                  {t.cta.openDashboard}
                  <IconArrowRight size={16} stroke={2} />
                </a>
              </Button>
            ) : (
              <Button asChild size="lg">
                <a href="/api/auth/discord/login">
                  <IconBrandDiscord size={16} stroke={1.75} />
                  {t.cta.loginDiscord}
                </a>
              </Button>
            )}
            <Button asChild variant="discord" size="lg">
              <a href={botInvite} target="_blank" rel="noopener noreferrer">
                <IconBrandDiscord size={16} stroke={1.75} />
                {t.cta.inviteBot}
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
