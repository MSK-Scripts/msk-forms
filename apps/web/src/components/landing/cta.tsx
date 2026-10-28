import { ArrowRight } from "@/components/icons";
import { DiscordMark } from "@/components/icons/brand-marks";
import { getDict } from "@/i18n";

/**
 * The green closing band above the footer, as on the shop's pages: one call
 * (sign in, or the dashboard when signed in) as the white button, the bot as
 * the second way.
 */
export async function CtaBand({ loggedIn, botInvite }: { loggedIn: boolean; botInvite: string }) {
  const t = await getDict();

  return (
    <section aria-labelledby="closing-title" className="surface-brand">
      <div className="container-page grid items-center gap-x-12 gap-y-6 py-[clamp(2.5rem,1.5rem+3vw,7.5rem)] min-[1024px]:grid-cols-[minmax(0,1fr)_auto]">
        <h2 id="closing-title" className="max-w-[24ch] text-h2 font-bold tracking-[-0.015em]">
          {t.cta.title}
        </h2>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <a
            href={loggedIn ? "/dashboard" : "/api/auth/discord/login"}
            className="inline-flex min-h-11 items-center gap-2 rounded-md bg-brand-button px-[1.125rem] py-2 font-semibold text-brand-button-foreground transition-colors duration-150 hover:bg-brand-muted"
          >
            {loggedIn ? (
              <>
                {t.cta.openDashboard}
                <ArrowRight className="h-4 w-4" />
              </>
            ) : (
              <>
                <DiscordMark className="h-4 w-4" />
                {t.cta.loginDiscord}
              </>
            )}
          </a>
          <a
            href={botInvite}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center font-semibold text-brand-foreground underline underline-offset-4 hover:text-brand-muted"
          >
            {t.cta.inviteBot}
            <span className="sr-only"> {t.site.newTab}</span>
          </a>
        </div>
      </div>
    </section>
  );
}
