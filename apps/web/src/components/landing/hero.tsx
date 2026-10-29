import { ArrowRight } from "@/components/icons";
import { DiscordMark } from "@/components/icons/brand-marks";
import { StatusPreview } from "@/components/landing/status-preview";
import { Accent, PageHero } from "@/components/page/page-hero";
import { TextLink } from "@/components/page/section";
import { Button } from "@/components/ui/button";
import { getActiveServerCount } from "@/lib/stats";
import { getDict, getLocale } from "@/i18n";

/**
 * The head of the landing page on the anthracite band: what MSK Forms is, the
 * three ways in (sign in or the dashboard, a demo form, the bot), the number
 * of servers that use it (counted from the database, not claimed), and a
 * miniature of the status page as the picture.
 */
export async function Hero({ loggedIn, botInvite }: { loggedIn: boolean; botInvite: string }) {
  const [t, locale, servers] = await Promise.all([getDict(), getLocale(), getActiveServerCount()]);

  return (
    <PageHero
      id="hero-title"
      kicker={t.hero.badge}
      title={
        <>
          {t.hero.headPre}
          <Accent>{t.hero.headAccent}</Accent>
          {t.hero.headPost}
        </>
      }
      lead={t.hero.sub}
      actions={
        <>
          {loggedIn ? (
            <Button asChild variant="band" size="lg">
              <a href="/dashboard">
                {t.hero.openDashboard}
                <ArrowRight className="h-5 w-5" />
              </a>
            </Button>
          ) : (
            <Button asChild variant="band" size="lg">
              <a href="/api/auth/discord/login">
                <DiscordMark className="h-5 w-5" />
                {t.hero.loginDiscord}
              </a>
            </Button>
          )}
          <Button asChild variant="band-outline" size="lg">
            <a href="/f/demo-whitelist">{t.hero.demo}</a>
          </Button>
          <TextLink href={botInvite} tone="band" newTab={t.site.newTab}>
            {t.hero.inviteBot}
          </TextLink>
        </>
      }
      aside={<StatusPreview />}
    >
      {servers > 0 && (
        <p className="text-small text-band-muted">
          <a
            href="/stats"
            className="inline-flex min-h-11 items-center gap-1.5 underline-offset-4 hover:text-band-foreground hover:underline"
          >
            <span className="font-semibold text-band-foreground tabular-nums">
              {new Intl.NumberFormat(locale).format(servers)}
            </span>
            {servers === 1 ? t.hero.serverOne : t.hero.serverMany}
          </a>
        </p>
      )}
    </PageHero>
  );
}
