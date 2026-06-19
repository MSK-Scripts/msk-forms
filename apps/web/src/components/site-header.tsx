import { IconBrandDiscord } from "@tabler/icons-react";

import { LanguageSwitcher } from "@/components/language-switcher";
import { LogoutButton } from "@/components/logout-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Wordmark } from "@/components/landing/wordmark";
import { Button } from "@/components/ui/button";
import { getDict, getLocale } from "@/i18n";

export interface HeaderUser {
  username: string;
  avatar: string | null;
}

export async function SiteHeader({ user }: { user: HeaderUser | null }) {
  const t = await getDict();
  const locale = await getLocale();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <a href="/" aria-label="MSK Forms home">
          <Wordmark />
        </a>

        <div className="flex items-center gap-2">
          <LanguageSwitcher locale={locale} />
          <ThemeToggle />
          {user ? (
            <>
              {user.avatar && (
                <img src={user.avatar} alt="" width={26} height={26} className="rounded-full" />
              )}
              <Button asChild variant="ghost" size="sm">
                <a href="/dashboard">{t.header.dashboard}</a>
              </Button>
              <LogoutButton label={t.header.logout} />
            </>
          ) : (
            <Button asChild size="sm">
              <a href="/api/auth/discord/login">
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
