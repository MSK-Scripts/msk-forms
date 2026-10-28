"use client";

import { ColorDot } from "@msk-forms/ui";
import type { Route } from "next";
import Link from "next/link";
import { useId, type ReactNode } from "react";

import { CaretDown, DotsThree, type IconComponent } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { dotColors } from "@/lib/color-dot";
import { cn } from "@/lib/utils";

import { useAnchoredPopover } from "./use-anchored-popover";

export interface RowMenuItem {
  id: string;
  label: string;
  icon?: IconComponent;
  /** A guild's colour as a dot before the label (a status on the board), readable in both themes. */
  dot?: string;
  /** Runs the action or opens its dialog. */
  onSelect?: () => void;
  /** Path in the app instead of an action. */
  href?: string;
  /** External address, opened in a new tab. */
  external?: string;
  /** A file to download (an export route), fetched as a plain document request in the same tab. */
  download?: string;
  /** Shown in red: only for actions that ask before they destroy something. */
  danger?: boolean;
  disabled?: boolean;
}

/**
 * The overflow menu of a table row: one or two actions inline, the rest here.
 *
 * Built on the native popover (`popover="auto"`, placed by
 * `useAnchoredPopover`): it opens in the top layer, so the scrolling
 * container of a DataTable cannot clip it, and the browser closes it on
 * Escape and on a click outside.
 *
 * The trigger is the three-dot icon by default. Where the menu is the action
 * itself (Move on a board card), `trigger` gives it a visible word and a
 * caret instead, and `heading` names the list.
 *
 * The entries are plain buttons and links in a list, not an ARIA menu: Tab
 * reaches them right after the button that opened them.
 */
export function RowMenu({
  label,
  items,
  size = "sm",
  trigger,
  heading,
  triggerId,
  className,
}: {
  /** Names the button for a screen reader: "More actions for Staff application". Contains the visible word of `trigger`. */
  label: string;
  items: RowMenuItem[];
  /** `sm` (36 px) inside a dense table, `md` (44 px) elsewhere. */
  size?: "sm" | "md";
  /** A visible word for the button ("Move"), shown with a caret instead of the three dots. */
  trigger?: ReactNode;
  /** A heading above the entries that names the list ("Move to"). */
  heading?: string;
  /** Id of the button, for a page that puts the focus back on it after a change. */
  triggerId?: string;
  className?: string;
}) {
  const id = useId();
  const headingId = `${id}-heading`;
  const { panelRef, triggerRef, hide } = useAnchoredPopover<HTMLButtonElement>();

  const itemClass = (danger?: boolean) =>
    cn("w-full justify-start font-medium", danger && "text-danger");

  return (
    <>
      {trigger ? (
        <Button
          ref={triggerRef}
          id={triggerId}
          type="button"
          size={size}
          variant="outline"
          popoverTarget={id}
          aria-label={label}
          className={cn("tap-target", className)}
        >
          {trigger}
          <CaretDown className="h-4 w-4" />
        </Button>
      ) : (
        <button
          ref={triggerRef}
          id={triggerId}
          type="button"
          popoverTarget={id}
          aria-label={label}
          title={label}
          className={cn(
            "inline-flex shrink-0 items-center justify-center rounded-md border-[1.5px] border-input text-foreground transition-colors duration-150 hover:border-foreground",
            size === "sm" ? "h-9 w-9" : "h-11 w-11",
            className,
          )}
        >
          <DotsThree className="h-5 w-5" weight="bold" />
        </button>
      )}
      <div
        ref={panelRef}
        id={id}
        popover="auto"
        aria-label={heading ? undefined : label}
        aria-labelledby={heading ? headingId : undefined}
        className="fixed inset-auto m-0 max-w-[min(20rem,calc(100vw-1rem))] min-w-[13rem] rounded-lg border border-border bg-card p-1.5 text-card-foreground shadow-[var(--shadow-card-hover)]"
      >
        {heading && (
          <p
            id={headingId}
            className="px-3 pt-1.5 pb-1 text-label font-semibold tracking-[0.08em] text-muted-foreground uppercase"
          >
            {heading}
          </p>
        )}
        <ul aria-labelledby={heading ? headingId : undefined} className="grid gap-0.5">
          {items.map((item) => {
            const Icon = item.icon;
            const content: ReactNode = (
              <>
                {Icon && <Icon className="h-4 w-4 shrink-0" />}
                {item.dot && <ColorDot {...dotColors(item.dot)} />}
                {item.label}
              </>
            );
            return (
              <li key={item.id}>
                {item.href ? (
                  <Button asChild variant="ghost" className={itemClass(item.danger)}>
                    <Link href={item.href as Route} prefetch={false} onClick={hide}>
                      {content}
                    </Link>
                  </Button>
                ) : item.download ? (
                  <Button asChild variant="ghost" className={itemClass(item.danger)}>
                    <a href={item.download} download onClick={hide}>
                      {content}
                    </a>
                  </Button>
                ) : item.external ? (
                  <Button asChild variant="ghost" className={itemClass(item.danger)}>
                    <a
                      href={item.external}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={hide}
                    >
                      {content}
                    </a>
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="ghost"
                    className={itemClass(item.danger)}
                    disabled={item.disabled}
                    onClick={() => {
                      hide();
                      item.onSelect?.();
                    }}
                  >
                    {content}
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}
