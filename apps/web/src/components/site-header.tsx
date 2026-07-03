import { IconBrandDiscord } from "@tabler/icons-react";

import { LanguageSwitcher } from "@/components/language-switcher";
import { LogoutButton } from "@/components/logout-button";
import { MobileMenu } from "@/components/mobile-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { Wordmark } from "@/components/landing/wordmark";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/lib/auth-actions";
import { isPrimaryHostname, requestHostname } from "@/lib/custom-domain";
import { resolveHostOAuth } from "@/lib/guild-oauth";
import { appBaseUrl } from "@/lib/url";
import { getDict, getLocale } from "@/i18n";

export interface HeaderUser {
  username: string;
  avatar: string | null;
}

/** Shared style for a row inside the mobile menu. */
const MENU_ROW =
  "flex items-center gap-2 rounded-sm px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground";

export async function SiteHeader({ user }: { user: HeaderUser | null }) {
  const t = await getDict();
  const locale = await getLocale();

  // The dashboard lives only on the primary domain. Login is host-aware: on a
  // custom domain whose guild has its OWN Discord OAuth app, log in right here
  // (relative) so that app is used and the session lands on this domain. Without
  // an own app, auth must run on the primary host (the OAuth state cookie and
  // callback must be same-origin), else login fails with a state mismatch.
  const host = await requestHostname();
  const onCustomDomain = Boolean(host) && !isPrimaryHostname(host!);
  const ownOAuth = onCustomDomain ? await resolveHostOAuth(host!) : null;
  const loginBase = onCustomDomain && !ownOAuth ? appBaseUrl() : "";
  const loginHref = `${loginBase}/api/auth/discord/login`;
  const dashboardHref = `${onCustomDomain ? appBaseUrl() : ""}/dashboard`;

  return (
    <header className="pwa-safe-top sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <a href="/" aria-label="MSK Forms home">
            <Wordmark />
          </a>
          <a
            href="/pricing"
            className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:block"
          >
            {t.pricing.nav}
          </a>
          <a
            href="/stats"
            className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:block"
          >
            {t.stats.nav}
          </a>
          <a
            href="https://forms.msk-scripts.de/msk-forms"
            className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:block"
          >
            MSK Scripts Hub
          </a>
        </div>

        <div className="flex items-center gap-2">
          <LanguageSwitcher locale={locale} />
          <ThemeToggle />
          <span className="mx-1 hidden h-5 w-px bg-border sm:block" aria-hidden />

          {/* Desktop auth actions */}
          {user ? (
            <div className="hidden items-center gap-2 sm:flex">
              {user.avatar && (
                <img
                  src={user.avatar}
                  alt=""
                  width={28}
                  height={28}
                  className="rounded-full ring-1 ring-border"
                />
              )}
              <Button asChild variant="ghost" size="sm">
                <a href={dashboardHref}>{t.header.dashboard}</a>
              </Button>
              <LogoutButton label={t.header.logout} />
            </div>
          ) : (
            <Button asChild size="sm" className="hidden sm:inline-flex">
              <a href={loginHref}>
                <IconBrandDiscord size={16} stroke={1.75} />
                {t.header.login}
              </a>
            </Button>
          )}

          {/* Mobile menu: nav links + auth actions that don't fit the bar */}
          <MobileMenu label={t.header.menu}>
            <a href="/pricing" className={MENU_ROW}>
              {t.pricing.nav}
            </a>
            <a href="/stats" className={MENU_ROW}>
              {t.stats.nav}
            </a>
            <a href="https://forms.msk-scripts.de/msk-forms" className={MENU_ROW}>
              MSK Scripts Hub
            </a>
            <div className="my-1 h-px bg-border" aria-hidden />
            {user ? (
              <>
                <a href={dashboardHref} className={MENU_ROW}>
                  {t.header.dashboard}
                </a>
                <form action={logoutAction}>
                  <button type="submit" className={`${MENU_ROW} w-full text-start`}>
                    {t.header.logout}
                  </button>
                </form>
              </>
            ) : (
              <a href={loginHref} className={MENU_ROW}>
                <IconBrandDiscord size={16} stroke={1.75} />
                {t.header.login}
              </a>
            )}
          </MobileMenu>
        </div>
      </div>
    </header>
  );
}
