import { IconArrowRight, IconBrandDiscord } from "@tabler/icons-react";

import { LinkButton } from "@/components/landing/link-button";

export function CtaBand({ loggedIn }: { loggedIn: boolean }) {
  return (
    <section className="mx-auto max-w-content px-6 py-20 lg:py-28">
      <div className="reveal relative overflow-hidden rounded-lg border border-border bg-bg-panel px-8 py-16 text-center">
        <div
          aria-hidden
          className="absolute -top-24 left-1/2 -z-0 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-accent/10 blur-3xl"
        />
        <div className="relative">
          <h2 className="mx-auto max-w-2xl font-heading text-3xl font-bold tracking-tight text-text-primary md:text-4xl">
            Start collecting applications people can actually follow.
          </h2>
          <div className="mt-9 flex justify-center">
            {loggedIn ? (
              <LinkButton href="/dashboard">
                Open dashboard
                <IconArrowRight size={16} stroke={2} />
              </LinkButton>
            ) : (
              <LinkButton href="/api/auth/discord/login">
                <IconBrandDiscord size={16} stroke={1.75} />
                Log in with Discord
              </LinkButton>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
