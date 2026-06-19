import { IconArrowRight, IconBrandDiscord } from "@tabler/icons-react";

import { LinkButton } from "@/components/landing/link-button";
import { StatusPreview } from "@/components/landing/status-preview";

export function Hero({ loggedIn }: { loggedIn: boolean }) {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-content items-center gap-14 px-6 pb-20 pt-20 lg:grid-cols-[1.05fr_0.95fr] lg:pb-28 lg:pt-24">
        <div>
          <p
            className="rise font-mono text-xs uppercase tracking-[0.28em] text-accent"
            style={{ animationDelay: "0ms" }}
          >
            Application platform
          </p>
          <h1
            className="rise mt-5 font-heading text-4xl font-extrabold leading-[1.04] tracking-tight text-text-primary md:text-5xl lg:text-6xl"
            style={{ animationDelay: "60ms" }}
          >
            Application forms with a real{" "}
            <span className="text-accent">status loop.</span>
          </h1>
          <p
            className="rise mt-6 max-w-xl text-lg leading-relaxed text-text-secondary"
            style={{ animationDelay: "120ms" }}
          >
            Build a form, share a link, let applicants track their status live.
            With a Discord bot any server can invite.
          </p>
          <div
            className="rise mt-9 flex flex-wrap items-center gap-3"
            style={{ animationDelay: "180ms" }}
          >
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
            <LinkButton href="/f/demo-whitelist" variant="ghost">
              View a demo form
            </LinkButton>
          </div>
        </div>

        <div className="rise lg:pl-4" style={{ animationDelay: "240ms" }}>
          <StatusPreview />
        </div>
      </div>
    </section>
  );
}
