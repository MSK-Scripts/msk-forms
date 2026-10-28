"use client";

import { usePathname } from "next/navigation";
import { useCallback, useId, useRef, useState } from "react";

import { useDismiss } from "@/components/dashboard-kit/use-dismiss";
import { ThemeSwitch, type ThemeSwitchLabels } from "@/components/dashboard-kit/theme-switch";
import { ArrowSquareOut, CaretDown, List, SignOut, User, X } from "@/components/icons";
import { DiscordMark } from "@/components/icons/brand-marks";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/i18n/dictionaries";
import { logoutAction } from "@/lib/auth-actions";
import { cn } from "@/lib/utils";

import { LanguagePicker } from "./language-picker";
import type { NavLink, ProductLine } from "./navigation";

export interface HeaderCopy {
  mainNav: string;
  submenu: string;
  newTab: string;
  menu: string;
  language: string;
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

const MENU_ID = "site-menu";

/** `aria-current` for a link of our own: the page itself, or a page below it. */
function currentFor(path: string, href: string): "page" | "true" | undefined {
  if (path === href) return "page";
  return href !== "/" && path.startsWith(`${href}/`) ? "true" : undefined;
}

// The current area gets the green underline, as in the shop.
const topLinkClass =
  "inline-flex min-h-11 items-center font-medium text-foreground transition-colors duration-150 " +
  "hover:text-primary aria-[current]:font-semibold aria-[current]:shadow-[inset_0_-3px_0_hsl(var(--primary))]";

/** One entry of a product line's panel: name, one line of description. */
function PanelLink({ link, newTab, onNavigate }: { link: NavLink; newTab: string; onNavigate?: () => void }) {
  return (
    <a
      href={link.href}
      onClick={onNavigate}
      aria-current={link.current ? "true" : undefined}
      {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={cn(
        "group grid min-h-11 content-center gap-0.5 rounded-md px-3 py-2 transition-colors duration-150 hover:bg-muted",
        link.current && "bg-accent-soft hover:bg-accent-soft",
      )}
    >
      <span
        className={cn(
          "flex items-center gap-1.5 font-semibold group-hover:text-primary",
          link.current ? "text-primary" : "text-foreground",
        )}
      >
        {link.label}
        {link.external && <ArrowSquareOut className="h-3.5 w-3.5 text-muted-foreground" />}
      </span>
      {link.description && <span className="text-small text-muted-foreground">{link.description}</span>}
      {link.external && <span className="sr-only"> {newTab}</span>}
    </a>
  );
}

/**
 * Main navigation from 1280 px: the pages of MSK Forms, then the shop's
 * product lines and its about page. Each product line is a link to its
 * overview plus a small button that opens a panel with its pages (the
 * disclosure pattern for navigation): the link still navigates, the button is
 * reachable by keyboard, Escape closes and returns the focus. Hovering an
 * entry opens its panel too.
 */
function MainNav({
  path,
  section,
  lines,
  about,
  copy,
  className,
}: {
  path: string;
  section: NavLink[];
  lines: ProductLine[];
  about: NavLink;
  copy: HeaderCopy;
  className?: string;
}) {
  const [open, setOpen] = useState<string | null>(null);
  const ref = useRef<HTMLUListElement>(null);

  useDismiss(open !== null, ref, (reason) => {
    if (reason === "escape" && open) document.getElementById(`nav-toggle-${open}`)?.focus();
    setOpen(null);
  });

  return (
    <nav aria-label={copy.mainNav} className={className}>
      <ul ref={ref} className="flex items-center gap-[clamp(0.75rem,1.4vw,2.25rem)]">
        {section.map((link) => (
          <li key={link.href}>
            <a href={link.href} aria-current={currentFor(path, link.href)} className={topLinkClass}>
              {link.label}
            </a>
          </li>
        ))}
        <li aria-hidden className="h-6 w-px bg-border" />
        {lines.map((line) => {
          const isOpen = open === line.id;
          const panelId = `nav-panel-${line.id}`;
          return (
            <li
              key={line.id}
              className="relative flex items-center"
              onMouseEnter={() => setOpen(line.id)}
              onMouseLeave={() => setOpen((current) => (current === line.id ? null : current))}
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
                  setOpen((current) => (current === line.id ? null : current));
                }
              }}
            >
              <a href={line.href} aria-current={line.current ? "true" : undefined} className={topLinkClass}>
                {line.label}
              </a>
              <button
                id={`nav-toggle-${line.id}`}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                aria-label={copy.submenu.replace("{name}", line.label)}
                onClick={() => setOpen(isOpen ? null : line.id)}
                className="-ml-1 inline-flex min-h-11 w-11 items-center justify-center rounded-md text-muted-foreground transition-colors duration-150 hover:text-primary"
              >
                <CaretDown className={cn("h-4 w-4 transition-transform duration-150", isOpen && "rotate-180")} />
              </button>

              {/* `pt-2` bridges the gap to the panel inside the entry, so the
                  pointer can travel down without leaving it. */}
              <div id={panelId} hidden={!isOpen} className="absolute top-full left-0 z-[60] pt-2">
                <ul className="grid w-[24rem] gap-0.5 rounded-lg border border-border bg-card p-2 shadow-[var(--shadow-card-hover)]">
                  {line.links.map((link) => (
                    <li key={link.href}>
                      <PanelLink link={link} newTab={copy.newTab} onNavigate={() => setOpen(null)} />
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          );
        })}
        <li>
          <a href={about.href} className={topLinkClass}>
            {about.label}
          </a>
        </li>
      </ul>
    </nav>
  );
}

/**
 * What the account entry holds, in the header panel and in the menu: the
 * Discord sign-in, or who is signed in with the way to the dashboard, and the
 * appearance switch.
 */
function AccountSections({
  account,
  copy,
  onNavigate,
}: {
  account: HeaderAccount;
  copy: HeaderCopy;
  onNavigate?: () => void;
}) {
  // Rendered twice (header panel and menu), so the label ids must differ.
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

/** The account entry in the header bar: "Log in" or the Discord name, with the panel below. */
function AccountMenu({ account, copy, className }: { account: HeaderAccount; copy: HeaderCopy; className?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
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
        aria-controls="account-panel"
        className="inline-flex min-h-11 max-w-[14rem] items-center gap-1.5 rounded-md px-2 font-medium text-foreground transition-colors duration-150 hover:text-primary"
      >
        {user?.avatar ? (
          <img src={user.avatar} alt="" width={24} height={24} className="h-6 w-6 shrink-0 rounded-full" />
        ) : (
          <User className="h-5 w-5 shrink-0" />
        )}
        {user ? (
          <>
            <span className="sr-only">{copy.account}: </span>
            <span translate="no" className="truncate">
              {user.username}
            </span>
          </>
        ) : (
          <span>{copy.login}</span>
        )}
        <CaretDown className={cn("h-3.5 w-3.5 shrink-0 transition-transform duration-150", open && "rotate-180")} />
      </button>

      <div
        id="account-panel"
        hidden={!open}
        className="absolute top-full right-0 z-[60] mt-2 w-[min(20rem,calc(100vw-2rem))] rounded-lg border border-border bg-card p-4 shadow-[var(--shadow-card-hover)]"
      >
        <AccountSections account={account} copy={copy} onNavigate={() => setOpen(false)} />
      </div>
    </div>
  );
}

/**
 * The header of the site pages, after the shop's Header: the MSK green stripe
 * on top, the brand, the navigation, then language and account. Below
 * 1280 px the navigation moves into a menu that opens below the bar (a
 * disclosure, not a modal: the page stays where it is and the panel scrolls on
 * its own).
 */
export function HeaderBar({
  locale,
  copy,
  section,
  lines,
  about,
  account,
}: {
  locale: Locale;
  copy: HeaderCopy;
  section: NavLink[];
  lines: ProductLine[];
  about: NavLink;
  account: HeaderAccount;
}) {
  const path = usePathname() ?? "/";
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useDismiss(menuOpen, headerRef, (reason) => {
    setMenuOpen(false);
    if (reason === "escape") menuButtonRef.current?.focus();
  });

  return (
    <header
      ref={headerRef}
      className="pwa-safe-top sticky top-0 z-50 border-t-4 border-b border-t-brand border-b-border bg-card"
    >
      <div className="container-page flex min-h-[var(--header-height)] items-center gap-[clamp(1rem,2vw,2.5rem)]">
        <a href="/" className="flex min-h-11 shrink-0 items-center gap-2.5 text-foreground">
          <img src="/logo.png" alt="" width={36} height={36} className="h-9 w-9 rounded-lg object-contain" />
          {/* Below 360 px the name gives way to the buttons; it stays the
              link's name for a screen reader. */}
          <span className="sr-only font-display text-lead font-bold tracking-[-0.01em] [font-stretch:108%] min-[360px]:not-sr-only">
            MSK Forms
          </span>
        </a>

        {/* Our own pages stay in the bar from 768 px; the shop's lines join
            them from 1280 px. */}
        <nav aria-label="MSK Forms" className="hidden md:block xl:hidden">
          <ul className="flex items-center gap-[clamp(0.75rem,1.4vw,2.25rem)]">
            {section.map((link) => (
              <li key={link.href}>
                <a href={link.href} aria-current={currentFor(path, link.href)} className={topLinkClass}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <MainNav path={path} section={section} lines={lines} about={about} copy={copy} className="hidden xl:block" />

        <div className="ml-auto flex items-center gap-[clamp(0.25rem,0.9vw,1.25rem)]">
          <LanguagePicker locale={locale} label={copy.language} className="hidden sm:inline-flex" />
          <AccountMenu account={account} copy={copy} className="hidden md:block" />
          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls={MENU_ID}
            className="inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-md border-[1.5px] border-input px-3 font-medium text-foreground transition-colors duration-150 hover:border-foreground xl:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <List className="h-5 w-5" />}
            <span className="sr-only min-[480px]:not-sr-only">{copy.menu}</span>
          </button>
        </div>
      </div>

      <div
        id={MENU_ID}
        hidden={!menuOpen}
        className="max-h-[calc(100dvh-var(--header-height)-5px)] overflow-y-auto overscroll-contain border-t border-border bg-card xl:hidden"
      >
        <div className="container-page grid gap-8 py-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] lg:gap-12">
          <nav aria-label={copy.mainNav} className="@container">
            <ul className="grid gap-6 @lg:grid-cols-2 @lg:gap-x-8">
              <li className="grid content-start gap-1">
                <a
                  href="/"
                  aria-current={path === "/" ? "page" : "true"}
                  className="inline-flex min-h-11 items-center self-start font-display text-h3 font-[650] text-foreground aria-[current]:shadow-[inset_0_-3px_0_hsl(var(--primary))]"
                >
                  MSK Forms
                </a>
                <ul className="grid gap-0.5">
                  {section.map((link) => (
                    <li key={link.href}>
                      <PanelLink
                        link={{ ...link, current: currentFor(path, link.href) !== undefined }}
                        newTab={copy.newTab}
                        onNavigate={() => setMenuOpen(false)}
                      />
                    </li>
                  ))}
                </ul>
              </li>
              {lines.map((line) => (
                <li key={line.id} className="grid content-start gap-1">
                  <a
                    href={line.href}
                    onClick={() => setMenuOpen(false)}
                    className="inline-flex min-h-11 items-center self-start font-display text-h3 font-[650] text-foreground hover:text-primary"
                  >
                    {line.label}
                  </a>
                  <ul className="grid gap-0.5">
                    {line.links.map((link) => (
                      <li key={link.href}>
                        <PanelLink link={link} newTab={copy.newTab} onNavigate={() => setMenuOpen(false)} />
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
              <li>
                <a
                  href={about.href}
                  onClick={() => setMenuOpen(false)}
                  className="inline-flex min-h-11 items-center font-display text-h3 font-[650] text-foreground hover:text-primary"
                >
                  {about.label}
                </a>
              </li>
            </ul>
          </nav>

          <div className="grid content-start gap-6 border-t border-border pt-6 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
            <AccountSections account={account} copy={copy} onNavigate={() => setMenuOpen(false)} />
            <div className="grid gap-2">
              <p className="kicker">{copy.language}</p>
              <LanguagePicker locale={locale} label={copy.language} className="self-start" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
