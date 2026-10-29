"use client";

import type { Route } from "next";
import Link from "next/link";
import { useId, useRef, useState } from "react";

import { GuildIcon } from "@/components/dashboard/guild-icon";
import { CaretDown, Check, Plus, SquaresFour } from "@/components/icons";
import { cn } from "@/lib/utils";

import { useDismiss } from "./use-dismiss";

export interface SwitcherGuild {
  id: string;
  name: string;
  /** Second line, the plan or the role of the person, say. */
  detail?: string;
  /** The Discord server icon (cdn.discordapp.com, allowed by the CSP). */
  iconUrl?: string | null;
  /** The guild's MSK Forms logo, shown when Discord has no icon. */
  logoUrl?: string | null;
  /** Path of this guild in the dashboard. */
  href: string;
}

export interface GuildSwitcherCopy {
  /** Heading above the button ("Server"). */
  label: string;
  /** Accessible name of the button, followed by the current guild. */
  switchLabel: string;
  /** Shown when no guild of the list is the current one. */
  none: string;
  /** Link to add a guild (the bot invite). */
  add: string;
  /** Hint below the list: why a guild may be missing. */
  missing: string;
}

function GuildMark({ guild, name }: { guild: SwitcherGuild | null; name: string }) {
  // No guild chosen: a neutral sign, not the initial of "No server chosen",
  // which would read like a guild of that letter.
  if (!guild) {
    return (
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground">
        <SquaresFour className="h-5 w-5" />
      </span>
    );
  }
  return (
    <GuildIcon
      icon={guild?.iconUrl ?? null}
      logoUrl={guild?.logoUrl}
      name={name}
      size={36}
      className="h-9 w-9 rounded-md"
      fallbackTextClassName="bg-accent-soft font-display text-small font-bold uppercase text-primary"
    />
  );
}

/**
 * The guild switcher at the top of the sidebar, after the shop's
 * ServerSwitcher. Discord calls guilds servers, so the copy does too.
 *
 * It lists only what the page handed it: the guilds the signed-in person is a
 * member of. Choosing one is a plain link to that guild's address; the page
 * behind it checks the membership again (requireGuildMembership), so nothing
 * here is a permission decision.
 *
 * An in-flow disclosure rather than a floating menu: it pushes the navigation
 * down instead of covering it, and works the same in the sidebar and in the
 * drawer on a phone.
 */
export function GuildSwitcher({
  guilds,
  currentId,
  addHref,
  copy,
}: {
  guilds: SwitcherGuild[];
  currentId: string | null;
  /** Where "Add a server" leads; an external bot invite opens as a document request. */
  addHref?: string;
  copy: GuildSwitcherCopy;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listId = useId();
  const current = guilds.find((g) => g.id === currentId) ?? null;
  const currentName = current ? current.name || current.id : copy.none;

  useDismiss(open, rootRef, (reason) => {
    setOpen(false);
    if (reason === "escape") buttonRef.current?.focus();
  });

  return (
    <div ref={rootRef} className="grid gap-1.5">
      <h2 className="px-1 text-label font-semibold tracking-[0.08em] text-muted-foreground uppercase">
        {copy.label}
      </h2>
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex min-h-12 w-full items-center gap-3 rounded-md border-[1.5px] border-input bg-card px-2.5 py-1.5 text-left",
          "transition-colors duration-150 hover:border-foreground",
        )}
      >
        <GuildMark guild={current} name={currentName} />
        <span className="grid min-w-0 flex-1">
          <span className="sr-only">{copy.switchLabel}: </span>
          <span translate="no" className="truncate font-semibold">
            {currentName}
          </span>
          {current?.detail && (
            <span className="truncate text-small text-muted-foreground">{current.detail}</span>
          )}
        </span>
        <CaretDown
          className={cn("h-4 w-4 shrink-0 transition-transform duration-150", open && "rotate-180")}
        />
      </button>

      <div
        id={listId}
        hidden={!open}
        className="grid gap-2 rounded-md border border-border bg-card p-1.5"
      >
        <ul className="grid gap-0.5">
          {guilds.map((guild) => {
            const isCurrent = guild.id === currentId;
            const name = guild.name || guild.id;
            return (
              <li key={guild.id}>
                <Link
                  href={guild.href as Route}
                  prefetch={false}
                  aria-current={isCurrent ? "page" : undefined}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex min-h-11 items-center gap-3 rounded-md px-2 py-1 transition-colors duration-150 hover:bg-muted",
                    "aria-[current=page]:font-semibold",
                  )}
                >
                  <GuildMark guild={guild} name={name} />
                  <span className="grid min-w-0 flex-1">
                    <span translate="no" className="truncate">
                      {name}
                    </span>
                    {guild.detail && (
                      <span className="truncate text-small text-muted-foreground">
                        {guild.detail}
                      </span>
                    )}
                  </span>
                  {isCurrent && <Check className="h-4 w-4 shrink-0 text-primary" />}
                </Link>
              </li>
            );
          })}
        </ul>
        {addHref && (
          <a
            href={addHref}
            className="flex min-h-11 items-center gap-2 rounded-md px-2 font-semibold text-primary hover:bg-muted"
          >
            <Plus className="h-4 w-4" />
            {copy.add}
          </a>
        )}
        <p className="px-2 pb-1 text-small text-muted-foreground">{copy.missing}</p>
      </div>
    </div>
  );
}
