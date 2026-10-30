import type { Branding } from "@msk-forms/shared";
import type { ReactNode } from "react";

import { CustomCss } from "@/components/branding/custom-css";
import { ThemeSwitch } from "@/components/dashboard-kit/theme-switch";
import { DiscordMark } from "@/components/icons/brand-marks";
import { accountCopy, dashboardLinks } from "@/components/site/account";
import { AccountMenu } from "@/components/site/account-menu";
import { LanguagePicker } from "@/components/site/language-picker";
import { getCurrentUser } from "@/lib/auth";
import { brandProps, logoUrl } from "@/lib/branding";
import { requestHostname } from "@/lib/custom-domain";
import { getDict, getLocale } from "@/i18n";

import { PoweredBy } from "./powered-by";

export interface PublicGuild {
  id: string;
  name: string;
  branding: Branding;
}

/**
 * The frame of a guild's public pages: forms, status pages, the form index
 * on /g, a handle or a custom domain. The craft is the shop's (type, spacing,
 * controls, focus); the colour is the customer's, with a readable fallback
 * per theme (lib/branding.ts). No msk-scripts.de navigation: the page belongs
 * to the guild, and only a small "Powered by" line on the Free plan says who
 * runs it. A signed-in visitor gets the site's account menu, so the way into
 * the dashboard is the same here as on the site pages.
 *
 * Three layers, each for a reason:
 * - the outer wrapper carries the accent (`brandProps`), so the bar, the
 *   page and the footer all take the guild's colour;
 * - `<main id="main">`, the one main of the page and the skip link's target;
 * - `.msk-form` on the content column, the element customers' custom CSS
 *   has always targeted (the column with heading and card), so their rules
 *   keep their meaning.
 */
export async function PublicFrame({
  guild,
  hubHref,
  returnTo,
  poweredBy = false,
  children,
}: {
  guild: PublicGuild;
  /** Where the guild's name leads: its form index on this host. */
  hubHref: string;
  /** The page itself, where a sign-in comes back to. */
  returnTo: string;
  /** Show the "Powered by MSK Forms" line (Free plan). */
  poweredBy?: boolean;
  children: ReactNode;
}) {
  const [dict, locale, user, host] = await Promise.all([
    getDict(),
    getLocale(),
    getCurrentUser(),
    requestHostname(),
  ]);
  const logo = logoUrl(guild.id, guild.branding);
  // Same-origin login link on every host. The login route is host-aware: on
  // a custom domain with its own Discord OAuth app it runs the whole flow
  // there, otherwise it falls back to the primary host.
  const loginHref = `/api/auth/discord/login?returnTo=${encodeURIComponent(returnTo)}`;

  return (
    <div
      {...brandProps(guild.branding)}
      className="flex min-h-dvh flex-col bg-background text-foreground"
    >
      <CustomCss css={guild.branding.customCss} />
      <header className="border-b border-border bg-card pwa-safe-top">
        <div className="public-column flex min-h-[var(--header-height)] items-center gap-3">
          <a href={hubHref} className="flex min-h-11 min-w-0 items-center gap-3 text-foreground">
            {logo ? (
              <img src={logo} alt="" className="h-9 w-auto max-w-[7rem] shrink-0 object-contain" />
            ) : (
              <span
                aria-hidden
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary font-display font-bold text-primary-foreground"
              >
                {guild.name.trim().charAt(0).toUpperCase()}
              </span>
            )}
            <span translate="no" className="truncate font-display text-lead font-bold">
              {guild.name}
            </span>
          </a>
          <div className="ms-auto flex shrink-0 items-center gap-1">
            {/* On a phone the guild's name needs the room; the language
                moves to the footer there. */}
            <LanguagePicker
              locale={locale}
              label={dict.header.language}
              className="hidden sm:inline-flex"
            />
            {user ? (
              <AccountMenu
                account={{
                  user: { username: user.username, avatar: user.avatar },
                  loginHref,
                  ...dashboardLinks(host),
                }}
                copy={accountCopy(dict)}
                hideNameOnPhone
              />
            ) : (
              <a
                href={loginHref}
                className="inline-flex min-h-11 items-center gap-2 rounded-md px-2.5 font-semibold text-foreground transition-colors hover:bg-muted"
              >
                <DiscordMark className="h-5 w-5 text-discord" />
                <span className="sr-only sm:not-sr-only">{dict.header.login}</span>
              </a>
            )}
          </div>
        </div>
      </header>

      <main
        id="main"
        tabIndex={-1}
        className="flex-1 py-[clamp(2rem,1.25rem+3vw,5rem)] focus:outline-none"
      >
        <div className="public-column">
          <div className="msk-form grid gap-[var(--space-stack)]">{children}</div>
        </div>
      </main>

      <footer className="border-t border-border pb-[env(safe-area-inset-bottom)]">
        <div className="public-column flex flex-wrap items-center justify-between gap-x-6 gap-y-3 py-5">
          <div className="flex flex-wrap items-center gap-3">
            <ThemeSwitch labels={dict.kit.shell.theme} />
            <LanguagePicker locale={locale} label={dict.header.language} className="sm:hidden" />
          </div>
          {poweredBy && <PoweredBy label={dict.form.poweredBy} />}
        </div>
      </footer>
    </div>
  );
}
