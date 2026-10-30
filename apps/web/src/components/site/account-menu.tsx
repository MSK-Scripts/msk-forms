"use client";

import { useCallback, useId, useRef, useState } from "react";

import { useDismiss } from "@/components/dashboard-kit/use-dismiss";
import { ThemeSwitch, type ThemeSwitchLabels } from "@/components/dashboard-kit/theme-switch";
import { CaretDown, SignOut, User } from "@/components/icons";
import { DiscordMark } from "@/components/icons/brand-marks";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/lib/auth-actions";
import { cn } from "@/lib/utils";

export interface AccountCopy {
  account: string;
  login: string;
  signIn: string;
  signedInAs: string;
  dashboard: string;
  mySubmissions: string;
  logout: string;
  theme: ThemeSwitchLabels;
}

export interface HeaderAccount {
  user: { username: string; avatar: string | null } | null;
  loginHref: string;
  dashboardHref: string;
  mySubmissionsHref: string;
}

/**
 * What the account entry holds, in the header panel and in the menu: the
 * Discord sign-in, or who is signed in with the way to the dashboard, and the
 * appearance switch.
 */
export function AccountSections({
  account,
  copy,
  onNavigate,
}: {
  account: HeaderAccount;
  copy: AccountCopy;
  onNavigate?: () => void;
}) {
  // Rendered twice on the site pages (header panel and menu), so the label
  // ids must differ.
  const id = useId();
  const { user } = account;
  return (
    <div className="grid gap-5">
      <div role="group" aria-labelledby={`${id}-account`} className="grid gap-2">
        <p id={`${id}-account`} className="kicker">
          {copy.account}
        </p>
        {user ? (
          <>
            <p className="text-small text-muted-foreground">
              {copy.signedInAs.replace("{name}", user.username)}
            </p>
            <ul className="grid">
              {[
                { href: account.dashboardHref, label: copy.dashboard },
                { href: account.mySubmissionsHref, label: copy.mySubmissions },
              ].map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    onClick={onNavigate}
                    className="flex min-h-11 items-center rounded-md px-3 font-medium text-foreground transition-colors duration-150 hover:bg-muted hover:text-primary"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
            <form action={logoutAction}>
              <Button type="submit" variant="outline" className="w-full justify-start">
                <SignOut className="h-4 w-4" />
                {copy.logout}
              </Button>
            </form>
          </>
        ) : (
          <Button asChild variant="discord" className="justify-start">
            <a href={account.loginHref}>
              <DiscordMark className="h-4 w-4" />
              {copy.signIn}
            </a>
          </Button>
        )}
      </div>

      <div role="group" aria-labelledby={`${id}-theme`} className="grid gap-2">
        <p id={`${id}-theme`} className="kicker">
          {copy.theme.group}
        </p>
        <ThemeSwitch labels={copy.theme} />
      </div>
    </div>
  );
}

/**
 * The account entry of a header: "Log in" or the Discord name, with the panel
 * below. Used by the site header and by the header of a guild's public pages,
 * so both offer the same way into the dashboard.
 */
export function AccountMenu({
  account,
  copy,
  hideNameOnPhone = false,
  className,
}: {
  account: HeaderAccount;
  copy: AccountCopy;
  /** Below 640 px show only the avatar, so a long name next to it keeps its room. */
  hideNameOnPhone?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const close = useCallback((reason: "outside" | "escape") => {
    setOpen(false);
    if (reason === "escape") buttonRef.current?.focus();
  }, []);
  useDismiss(open, ref, close);
  const { user } = account;

  return (
    <div className={cn("relative", className)} ref={ref}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className="inline-flex min-h-11 max-w-[14rem] items-center gap-1.5 rounded-md px-2 font-medium text-foreground transition-colors duration-150 hover:text-primary"
      >
        {user?.avatar ? (
          <img
            src={user.avatar}
            alt=""
            width={24}
            height={24}
            className="h-6 w-6 shrink-0 rounded-full"
          />
        ) : (
          <User className="h-5 w-5 shrink-0" />
        )}
        {user ? (
          <>
            <span className="sr-only">{copy.account}: </span>
            <span translate="no" className={cn("truncate", hideNameOnPhone && "max-sm:sr-only")}>
              {user.username}
            </span>
          </>
        ) : (
          <span>{copy.login}</span>
        )}
        <CaretDown
          className={cn(
            "h-3.5 w-3.5 shrink-0 transition-transform duration-150",
            open && "rotate-180",
          )}
        />
      </button>

      <div
        id={panelId}
        hidden={!open}
        className="absolute top-full right-0 z-[60] mt-2 w-[min(20rem,calc(100vw-2rem))] rounded-lg border border-border bg-card p-4 shadow-[var(--shadow-card-hover)]"
      >
        <AccountSections account={account} copy={copy} onNavigate={() => setOpen(false)} />
      </div>
    </div>
  );
}
