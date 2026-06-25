import { IconBrandDiscord } from "@tabler/icons-react";

import { LanguageSwitcher } from "@/components/language-switcher";
import { LogoutButton } from "@/components/logout-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Wordmark } from "@/components/landing/wordmark";
import { Button } from "@/components/ui/button";
import { isPrimaryHostname, requestHostname } from "@/lib/custom-domain";
import { resolveHostOAuth } from "@/lib/guild-oauth";
import { appBaseUrl } from "@/lib/url";
import { getDict, getLocale } from "@/i18n";

export interface HeaderUser {
  username: string;
  avatar: string | null;
}

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
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
        </div>

        <div className="flex items-center gap-2">
          <LanguageSwitcher locale={locale} />
          <ThemeToggle />
          <span className="mx-1 hidden h-5 w-px bg-border sm:block" aria-hidden />
          {user ? (
            <div className="flex items-center gap-2">
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
            <Button asChild size="sm">
              <a href={loginHref}>
                <IconBrandDiscord size={16} stroke={1.75} />
                {t.header.login}
              </a>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
