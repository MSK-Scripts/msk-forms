"use client";

import { SubmissionStatusBadge } from "@msk-forms/ui";
import type { Route } from "next";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";

import { Notice } from "@/components/dashboard-kit";
import { LocalDateTime } from "@/components/public/local-datetime";

import { MoveMenu } from "./move-menu";

export interface BoardColumn {
  key: string;
  label: string;
  color: string;
}

export interface BoardSubmission {
  id: string;
  status: string;
  formTitle: string;
  /** Discord username; null for an anonymous submission. */
  applicant: string | null;
  /** ISO timestamp of the submission. */
  submittedAt: string;
}

export interface BoardLabels {
  region: string;
  move: string;
  moveCard: string;
  moveTo: string;
  moved: string;
  empty: string;
  anonymous: string;
  countOne: string;
  countMany: string;
  saveFailed: string;
  dismiss: string;
}

const fill = (template: string, values: Record<string, string>) =>
  template.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? "");

/**
 * Submissions grouped into status columns. Each card opens the submission;
 * its Move button lists the other statuses, so a card changes column with a
 * click or the keyboard and no dragging. The change is optimistic and
 * reverts on failure (it posts to the same idempotent events route as the
 * detail view). A polite live region says where the card went, and the focus
 * follows the card to its new column.
 *
 * The board scrolls sideways in its own focusable container, never the page.
 */
export function KanbanBoard({
  guildId,
  columns,
  initial,
  labels,
}: {
  guildId: string;
  columns: BoardColumn[];
  initial: BoardSubmission[];
  labels: BoardLabels;
}) {
  const [items, setItems] = useState(initial);
  // A live update refreshes the page and hands over new cards: take them.
  const [seen, setSeen] = useState(initial);
  if (initial !== seen) {
    setSeen(initial);
    setItems(initial);
  }
  const [error, setError] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const focusCard = useRef<string | null>(null);
  const baseId = useId();

  // After a move the card sits in another column: put the focus back on its
  // Move button there, so the keyboard stays with the card.
  useEffect(() => {
    const id = focusCard.current;
    if (!id) return;
    focusCard.current = null;
    rootRef.current?.querySelector<HTMLElement>(`[data-move-trigger="${CSS.escape(id)}"]`)?.focus();
  }, [items]);

  const name = (s: BoardSubmission) => s.applicant ?? labels.anonymous;
  const labelOf = (key: string) => columns.find((c) => c.key === key)?.label ?? key;

  async function move(card: BoardSubmission, status: string) {
    const prev = items;
    focusCard.current = card.id;
    setItems((cur) => cur.map((s) => (s.id === card.id ? { ...s, status } : s)));
    setError(null);
    setAnnouncement("");
    try {
      const res = await fetch(`/api/guilds/${guildId}/submissions/${card.id}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "status", status }),
      });
      if (!res.ok) throw new Error(labels.saveFailed);
      setAnnouncement(fill(labels.moved, { name: name(card), status: labelOf(status) }));
    } catch (err) {
      focusCard.current = card.id;
      setItems(prev); // revert
      setError(err instanceof Error ? err.message : labels.saveFailed);
    }
  }

  return (
    <div ref={rootRef} className="grid gap-3">
      <p role="status" className="sr-only">
        {announcement}
      </p>
      {error && (
        <Notice
          tone="danger"
          role="alert"
          title={error}
          onDismiss={() => setError(null)}
          dismissLabel={labels.dismiss}
        />
      )}

      <div
        role="region"
        aria-label={labels.region}
        tabIndex={0}
        className="max-h-[min(80dvh,64rem)] overflow-auto rounded-lg border border-border bg-background"
      >
        <div className="grid min-w-fit auto-cols-[minmax(16.5rem,1fr)] grid-flow-col gap-3 p-3">
          {columns.map((col) => {
            const cards = items.filter((s) => s.status === col.key);
            const headId = `${baseId}-${col.key}`;
            const targets = columns.filter((c) => c.key !== col.key);
            return (
              <section
                key={col.key}
                aria-labelledby={headId}
                className="grid content-start gap-2 rounded-lg bg-muted p-2"
              >
                <h2
                  id={headId}
                  className="sticky top-0 z-20 -mx-2 -mt-2 flex items-center justify-between gap-2 rounded-t-lg bg-muted px-3 pt-3 pb-1"
                >
                  <SubmissionStatusBadge label={col.label} color={col.color} />
                  <span className="text-small font-semibold text-muted-foreground tabular-nums">
                    {cards.length}
                    <span className="sr-only">
                      {" "}
                      {cards.length === 1 ? labels.countOne : labels.countMany}
                    </span>
                  </span>
                </h2>

                {cards.length === 0 ? (
                  <p className="rounded-md border border-dashed border-input px-3 py-6 text-center text-small text-muted-foreground">
                    {labels.empty}
                  </p>
                ) : (
                  <ul className="grid gap-2">
                    {cards.map((s) => (
                      <li
                        key={s.id}
                        className="relative grid gap-1 rounded-lg border border-border bg-card p-3 text-card-foreground shadow-[var(--shadow-card)] transition-[border-color,box-shadow] duration-150 hover:border-primary hover:shadow-[var(--shadow-card-hover)]"
                      >
                        {/* The name is the card's link; its hit area covers the card. */}
                        <Link
                          href={`/dashboard/${guildId}/submissions/${s.id}` as Route}
                          prefetch={false}
                          translate={s.applicant ? "no" : undefined}
                          className="w-fit font-semibold break-words text-foreground after:absolute after:inset-0 after:rounded-lg hover:text-primary"
                        >
                          {name(s)}
                        </Link>
                        <span
                          translate="no"
                          className="text-small break-words text-muted-foreground"
                        >
                          {s.formTitle}
                        </span>
                        <span className="text-small text-muted-foreground tabular-nums">
                          <LocalDateTime iso={s.submittedAt} />
                        </span>
                        {targets.length > 0 && (
                          <div className="relative z-10 mt-1.5 flex justify-end">
                            <MoveMenu
                              cardId={s.id}
                              label={fill(labels.moveCard, { name: name(s) })}
                              text={labels.move}
                              heading={labels.moveTo}
                              targets={targets}
                              onPick={(key) => move(s, key)}
                            />
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
