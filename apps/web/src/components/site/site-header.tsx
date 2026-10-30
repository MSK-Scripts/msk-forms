import { getCurrentUser } from "@/lib/auth";
import { isPrimaryHostname, requestHostname } from "@/lib/custom-domain";
import { resolveHostOAuth } from "@/lib/guild-oauth";
import { appBaseUrl } from "@/lib/url";
import { getDict, getLocale } from "@/i18n";

import { accountCopy, dashboardLinks } from "./account";
import { HeaderBar } from "./header-bar";
import { aboutLink, productLines, sectionLinks } from "./navigation";

/**
 * The header of the site pages (landing, pricing, statistics, legal pages),
 * built like the shop's so MSK Forms reads as a section of msk-scripts.de.
 * Reads the session and the copy on the server and hands them to the client
 * bar, which owns the open panels.
 */
export async function SiteHeader() {
  const [dict, locale, user, host] = await Promise.all([
    getDict(),
    getLocale(),
    getCurrentUser(),
    requestHostname(),
  ]);
  const t = dict.site;

  // Login is host-aware: on a custom domain whose guild has its OWN Discord
  // OAuth app, log in right here (relative) so that app is used and the
  // session lands on this domain.
  // Without an own app, auth must run on the primary host (the OAuth state
  // cookie and callback must be same-origin), else login fails with a state
  // mismatch.
  const onCustomDomain = Boolean(host) && !isPrimaryHostname(host!);
  const ownOAuth = onCustomDomain ? await resolveHostOAuth(host!) : null;
  const loginBase = onCustomDomain && !ownOAuth ? appBaseUrl() : "";

  return (
    <HeaderBar
      locale={locale}
      copy={{
        mainNav: t.mainNav,
        submenu: t.submenu,
        newTab: t.newTab,
        menu: dict.header.menu,
        language: dict.header.language,
        ...accountCopy(dict),
      }}
      section={sectionLinks(dict)}
      lines={productLines(t, locale)}
      about={aboutLink(t, locale)}
      account={{
        user: user ? { username: user.username, avatar: user.avatar } : null,
        loginHref: `${loginBase}/api/auth/discord/login`,
        ...dashboardLinks(host),
      }}
    />
  );
}
