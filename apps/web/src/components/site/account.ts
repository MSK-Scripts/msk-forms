import type { Dictionary } from "@/i18n";
import { isPrimaryHostname } from "@/lib/custom-domain";
import { appBaseUrl } from "@/lib/url";

import type { AccountCopy } from "./account-menu";

/** The account entry's copy, the same in the site header and on a guild's public pages. */
export function accountCopy(dict: Dictionary): AccountCopy {
  return {
    account: dict.site.account,
    login: dict.header.login,
    signIn: dict.hero.loginDiscord,
    signedInAs: dict.site.signedInAs,
    dashboard: dict.header.dashboard,
    mySubmissions: dict.dashboard.mySubmissions,
    logout: dict.header.logout,
    theme: dict.kit.shell.theme,
  };
}

/**
 * The account entry's way into the dashboard. The dashboard lives only on the
 * primary domain, so from a custom domain the links lead there.
 */
export function dashboardLinks(host: string | null): {
  dashboardHref: string;
  mySubmissionsHref: string;
} {
  const base = host && !isPrimaryHostname(host) ? appBaseUrl() : "";
  return { dashboardHref: `${base}/dashboard`, mySubmissionsHref: `${base}/dashboard/me` };
}
