"use client";

import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";

import { ArrowLeft, List, Lock, SignOut, X } from "@/components/icons";
import type { Locale } from "@/i18n/dictionaries";
import { cn } from "@/lib/utils";

import { LanguageSelect } from "./language-select";
import { currentNavId, type ShellNavGroup } from "./nav";
import { ThemeSwitch, type ThemeSwitchLabels } from "./theme-switch";

/**
 * The app shell of the dashboard, after the shop's AppShell.
 *
 * - A top bar with the MSK green stripe, the product name and, below the
 *   sidebar breakpoint, the menu button and the title of the current page.
 * - A sidebar with labelled groups, the guild switcher at the top and
 *   appearance, language, account and the way back to the website at the
 *   bottom.
 * - Below 64rem the sidebar becomes a drawer on the native `<dialog>`: focus
 *   trap, Escape and the inert page come from the browser, and no `<style>`
 *   is injected at runtime. Up to four areas marked `mobile` also sit in a
 *   bar at the bottom, because hidden navigation is found about half as often.
 * - Without `nav` the shell is the signed-out frame: top bar, content, and
 *   appearance and language in a bar below.
 *
 * The shell renders the one `<main id="main">` a skip link points to. Copy
 * comes from the `kit.shell` section of the dictionary.
 */

export interface ShellCopy {
  /** Name of the sidebar navigation landmark. */
  nav: string;
  /** Name of the bottom bar landmark on a phone. */
  mobileNav: string;
  menuOpen: string;
  menuClose: string;
  backToSite: string;
  signOut: string;
  language: string;
  theme: ThemeSwitchLabels;
}

export interface ShellAccount {
  name: string;
  detail?: ReactNode;
  /** The sign-out Server Action (lib/auth-actions.ts), posted by a form, so it works before hydration. */
  signOut: (formData: FormData) => void | Promise<void>;
}

interface AppShellProps {
  productName: string;
  /** Path the product name links to (the overview). */
  homeHref: string;
  nav?: ShellNavGroup[];
  /** Current item by id. Without it the item the address belongs to. */
  currentId?: string;
  /** Called before a sidebar link navigates; the link keeps its href. */
  onNavigate?: (id: string, event: MouseEvent<HTMLAnchorElement>) => void;
  /** Title of the page, shown in the top bar below the sidebar breakpoint. */
  pageTitle?: string;
  switcher?: ReactNode;
  account?: ShellAccount;
  /** The current language, for the language choice. */
  locale: Locale;
  copy: ShellCopy;
  children: ReactNode;
}

const navItemClass = cn(
  "flex min-h-11 items-center gap-3 rounded-md px-3 text-foreground transition-colors duration-150",
  "hover:bg-muted",
  // Current page: soft accent surface, green label and a bar on the inline
  // start, so it is not told by colour alone.
  "aria-[current=page]:bg-accent-soft aria-[current=page]:font-semibold aria-[current=page]:text-primary",
  "aria-[current=page]:shadow-[inset_3px_0_0_hsl(var(--primary))]",
);

const groupLabelClass = "px-3 text-label font-semibold uppercase tracking-[0.08em] text-muted-foreground";

function NavList({
  nav,
  current,
  onNavigate,
  onAfterNavigate,
  label,
}: {
  nav: ShellNavGroup[];
  current: string | undefined;
  onNavigate?: AppShellProps["onNavigate"];
  onAfterNavigate?: () => void;
  label: string;
}) {
  return (
    <nav aria-label={label} className="grid gap-5">
      {nav.map((group) => (
        <div key={group.id} className="grid gap-1">
          {group.label && <h2 className={groupLabelClass}>{group.label}</h2>}
          <ul className="grid gap-0.5">
            {group.items.map(({ id, href, label: itemLabel, icon: Icon, locked }) => (
              <li key={id}>
                {locked ? (
                  <div className="flex min-h-11 items-start gap-3 rounded-md px-3 py-2 text-muted-foreground">
                    <Lock className="mt-0.5 h-5 w-5 shrink-0" />
                    <span className="grid min-w-0 gap-0.5">
                      <span className="truncate">{itemLabel}</span>
                      <span className="text-small leading-snug">{locked}</span>
                    </span>
                  </div>
                ) : (
                  <Link
                    href={href as Route}
                    prefetch={false}
                    aria-current={current === id ? "page" : undefined}
                    onClick={(event) => {
                      onNavigate?.(id, event);
                      onAfterNavigate?.();
                    }}
                    className={navItemClass}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <span className="min-w-0 truncate">{itemLabel}</span>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function SidebarFooter({ account, copy, locale }: Pick<AppShellProps, "account" | "copy" | "locale">) {
  return (
    <div className="@container grid gap-4 border-t border-border pt-4">
      {/* The three choices share the width. In a narrow sidebar the icons give
          way to the words, which carry the meaning. */}
      <ThemeSwitch
        labels={copy.theme}
        className="w-full [&>button]:flex-1 [&>button]:px-1.5 @max-[17rem]:[&_svg]:hidden"
      />
      <LanguageSelect locale={locale} label={copy.language} />
      {account && (
        <div className="grid gap-2 rounded-md bg-muted p-3">
          <div className="min-w-0">
            <p translate="no" className="truncate font-semibold">
              {account.name}
            </p>
            {account.detail && <div className="text-small text-muted-foreground">{account.detail}</div>}
          </div>
          <form action={account.signOut}>
            <button
              type="submit"
              className={cn(
                "inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md border-[1.5px] border-input bg-card px-3 font-semibold",
                "transition-colors duration-150 hover:border-foreground",
              )}
            >
              <SignOut className="h-4 w-4" />
              {copy.signOut}
            </button>
          </form>
        </div>
      )}
      {/* A document request on purpose: the public site has a layout of its
          own, and the way back should not keep any dashboard state. */}
      <a href="/" className={navItemClass}>
        <ArrowLeft className="h-5 w-5 shrink-0" />
        {copy.backToSite}
      </a>
    </div>
  );
}

function SidebarBody(
  props: {
    nav: ShellNavGroup[];
    current: string | undefined;
    switcher?: ReactNode;
    onNavigate?: AppShellProps["onNavigate"];
    onAfterNavigate?: () => void;
  } & Pick<AppShellProps, "account" | "copy" | "locale">,
) {
  return (
    <div className="flex flex-1 flex-col gap-6 p-3">
      {props.switcher}
      <NavList
        nav={props.nav}
        current={props.current}
        onNavigate={props.onNavigate}
        onAfterNavigate={props.onAfterNavigate}
        label={props.copy.nav}
      />
      <div className="mt-auto">
        <SidebarFooter account={props.account} copy={props.copy} locale={props.locale} />
      </div>
    </div>
  );
}

/** The sidebar as a modal drawer below the breakpoint. Its content mounts only while it is open. */
function NavDrawer({
  open,
  onClose,
  children,
  closeLabel,
  title,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  closeLabel: string;
  title: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-label={title}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className={cn(
        // Full height at the inline start, at most 22rem and never wider than
        // the window minus a strip to tap out of it.
        "m-0 h-dvh max-h-none w-[min(22rem,calc(100vw-3rem))] max-w-none overflow-y-auto overscroll-contain",
        "border-r border-border bg-card p-0 text-card-foreground",
        "backdrop:bg-black/50",
      )}
    >
      {open && (
        <div className="flex min-h-full flex-col">
          <div className="sticky top-0 z-10 flex items-center justify-between gap-2 border-t-4 border-b border-t-brand border-b-border bg-card px-4 py-2">
            <span className="font-display text-lead font-bold">{title}</span>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md hover:bg-muted"
            >
              <X className="h-5 w-5" />
              <span className="sr-only">{closeLabel}</span>
            </button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  );
}

export function AppShell({
  productName,
  homeHref,
  nav,
  currentId,
  onNavigate,
  pageTitle,
  switcher,
  account,
  locale,
  copy,
  children,
}: AppShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();
  const current = currentId ?? (nav ? currentNavId(nav, pathname) : undefined);
  const mobileItems = (nav ?? [])
    .flatMap((g) => g.items)
    .filter((i) => i.mobile && !i.locked)
    .slice(0, 4);
  const signedIn = Boolean(nav);

  return (
    <div className="flex min-h-dvh flex-1 flex-col">
      <header className="sticky top-0 z-40 border-t-4 border-b border-t-brand border-b-border bg-card">
        <div className="flex min-h-[var(--app-topbar)] items-center gap-2 px-[var(--app-gutter)]">
          {signedIn && (
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-haspopup="dialog"
              className="-ml-2 inline-flex min-h-11 min-w-11 items-center justify-center rounded-md hover:bg-muted lg:hidden"
            >
              <List className="h-6 w-6" />
              <span className="sr-only">{copy.menuOpen}</span>
            </button>
          )}
          <Link
            href={homeHref as Route}
            prefetch={false}
            className="flex min-h-11 min-w-0 shrink-0 items-center gap-2.5 text-foreground"
          >
            <Image src="/logo.png" alt="" width={32} height={32} className="h-8 w-8 rounded-md object-contain" />
            <span className="font-display text-lead font-bold">{productName}</span>
          </Link>
          {pageTitle && (
            // The page title stays visible on a phone, where the sidebar is
            // folded away. On wide screens the page header says it.
            <span className="ml-1 min-w-0 truncate border-l border-border pl-3 text-muted-foreground lg:hidden">
              {pageTitle}
            </span>
          )}
        </div>
      </header>

      {signedIn && nav ? (
        <div className="flex flex-1">
          <aside className="sticky top-[calc(var(--app-topbar)+5px)] hidden h-[calc(100dvh-var(--app-topbar)-5px)] w-[var(--app-sidebar)] shrink-0 flex-col overflow-y-auto border-r border-border bg-card lg:flex">
            <SidebarBody
              nav={nav}
              current={current}
              switcher={switcher}
              onNavigate={onNavigate}
              account={account}
              copy={copy}
              locale={locale}
            />
          </aside>

          <NavDrawer
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            closeLabel={copy.menuClose}
            title={productName}
          >
            <SidebarBody
              nav={nav}
              current={current}
              switcher={switcher}
              onNavigate={onNavigate}
              onAfterNavigate={() => setDrawerOpen(false)}
              account={account}
              copy={copy}
              locale={locale}
            />
          </NavDrawer>

          <main
            id="main"
            tabIndex={-1}
            className={cn(
              "min-w-0 flex-1 px-[var(--app-gutter)] py-[var(--app-gutter-y)]",
              mobileItems.length > 0 &&
                "pb-[calc(var(--app-tabbar)+var(--app-gutter-y))] lg:pb-[var(--app-gutter-y)]",
            )}
          >
            <div className="@container mx-auto w-full max-w-[var(--app-content)]">{children}</div>
          </main>
        </div>
      ) : (
        <>
          <main id="main" tabIndex={-1} className="flex-1 px-[var(--app-gutter)] py-[var(--app-gutter-y)]">
            <div className="@container mx-auto w-full max-w-[var(--app-content)]">{children}</div>
          </main>
          <footer className="border-t border-border bg-card">
            <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3 px-[var(--app-gutter)] py-3">
              <ThemeSwitch labels={copy.theme} />
              <LanguageSelect locale={locale} label={copy.language} className="w-56" />
              <a href="/" className="inline-flex min-h-11 items-center gap-2 text-primary hover:underline">
                <ArrowLeft className="h-4 w-4" />
                {copy.backToSite}
              </a>
            </div>
          </footer>
        </>
      )}

      {mobileItems.length > 0 && (
        <nav
          aria-label={copy.mobileNav}
          className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card pb-[env(safe-area-inset-bottom,0px)] lg:hidden"
        >
          <ul className="grid h-[var(--app-tabbar)] auto-cols-fr grid-flow-col">
            {mobileItems.map(({ id, href, label, icon: Icon }) => (
              <li key={id} className="min-w-0">
                <Link
                  href={href as Route}
                  prefetch={false}
                  aria-current={current === id ? "page" : undefined}
                  onClick={(event) => onNavigate?.(id, event)}
                  className={cn(
                    "flex h-full min-h-11 flex-col items-center justify-center gap-0.5 px-1 text-label font-semibold text-muted-foreground",
                    "aria-[current=page]:text-primary aria-[current=page]:shadow-[inset_0_3px_0_hsl(var(--primary))]",
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="w-full truncate text-center">{label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}
