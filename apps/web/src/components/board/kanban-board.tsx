"use client";

import type { Route } from "next";
import { StatusBadge } from "@msk-forms/ui";
import Link from "next/link";
import { useState } from "react";

export interface BoardColumn {
  key: string;
  label: string;
  color: string;
}

export interface BoardSubmission {
  id: string;
  status: string;
  formTitle: string;
  applicant: string;
  date: string;
}

export interface BoardLabels {
  moveTo: string;
  empty: string;
  open: string;
  saveFailed: string;
}

/**
 * Submissions grouped into status columns. Reviewers move a card to another
 * status via its select; the change is optimistic and reverts on failure (it
 * posts to the same idempotent events route as the detail view).
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
  const [error, setError] = useState<string | null>(null);

  async function move(id: string, status: string) {
    const prev = items;
    setItems((cur) => cur.map((s) => (s.id === id ? { ...s, status } : s)));
    setError(null);
    try {
      const res = await fetch(`/api/guilds/${guildId}/submissions/${id}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "status", status }),
      });
      if (!res.ok) throw new Error(labels.saveFailed);
    } catch (err) {
      setItems(prev); // revert
      setError(err instanceof Error ? err.message : labels.saveFailed);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex gap-4 overflow-x-auto pb-2">
        {columns.map((col) => {
          const cards = items.filter((s) => s.status === col.key);
          return (
            <div key={col.key} className="flex w-72 shrink-0 flex-col gap-2">
              <div className="flex items-center justify-between">
                <StatusBadge label={col.label} color={col.color} />
                <span className="text-xs text-muted-foreground">{cards.length}</span>
              </div>
              <div className="flex flex-col gap-2">
                {cards.length === 0 && (
                  <p className="rounded-md border border-dashed border-border px-3 py-6 text-center text-xs text-muted-foreground">
                    {labels.empty}
                  </p>
                )}
                {cards.map((s) => (
                  <div key={s.id} className="flex flex-col gap-2 rounded-md border border-border bg-card p-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium text-foreground">{s.applicant}</span>
                      <span className="text-xs text-muted-foreground">{s.formTitle}</span>
                      <span className="font-mono text-[11px] text-muted-foreground">{s.date}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <select
                        aria-label={labels.moveTo}
                        value={s.status}
                        onChange={(e) => move(s.id, e.target.value)}
                        className="h-8 flex-1 rounded-md border border-input bg-background px-2 text-xs text-foreground"
                      >
                        {columns.map((c) => (
                          <option key={c.key} value={c.key}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                      <Link
                        href={`/dashboard/${guildId}/submissions/${s.id}` as Route}
                        className="shrink-0 text-xs font-medium text-primary hover:underline"
                      >
                        {labels.open}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
