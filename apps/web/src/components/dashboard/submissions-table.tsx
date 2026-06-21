"use client";

import type { Route } from "next";
import { Button, StatusBadge } from "@msk-forms/ui";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export interface SubmissionRow {
  id: string;
  applicant: string;
  avatar: string | null;
  formTitle: string;
  date: string;
  status: string;
}

export interface StatusOption {
  key: string;
  label: string;
  color: string;
}

export interface SubmissionsTableLabels {
  colApplicant: string;
  colForm: string;
  colDate: string;
  colStatus: string;
  open: string;
  selected: string;
  apply: string;
  applying: string;
  moveTo: string;
  bulkFailed: string;
}

export function SubmissionsTable({
  guildId,
  rows,
  options,
  canReview,
  labels,
}: {
  guildId: string;
  rows: SubmissionRow[];
  options: StatusOption[];
  canReview: boolean;
  labels: SubmissionsTableLabels;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState(options[0]?.key ?? "");
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allSelected = rows.length > 0 && selected.size === rows.length;
  const resolve = (key: string) =>
    options.find((o) => o.key === key) ?? { key, label: key, color: "#6b6b72" };

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(rows.map((r) => r.id)));
  }

  async function apply() {
    setError(null);
    setApplying(true);
    try {
      const res = await fetch(`/api/guilds/${guildId}/submissions/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [...selected], status: bulkStatus }),
      });
      if (!res.ok) throw new Error(labels.bulkFailed);
      setSelected(new Set());
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : labels.bulkFailed);
    } finally {
      setApplying(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {canReview && selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-md border border-border bg-card p-3">
          <span className="text-sm text-foreground">
            {selected.size} {labels.selected}
          </span>
          <select
            aria-label={labels.moveTo}
            value={bulkStatus}
            onChange={(e) => setBulkStatus(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-2 text-sm text-foreground"
          >
            {options.map((o) => (
              <option key={o.key} value={o.key}>
                {o.label}
              </option>
            ))}
          </select>
          <Button type="button" onClick={apply} disabled={applying}>
            {applying ? labels.applying : labels.apply}
          </Button>
          {error && <span className="text-sm text-destructive">{error}</span>}
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {canReview && (
                <th className="px-4 py-3">
                  <input
                    type="checkbox"
                    aria-label="select all"
                    checked={allSelected}
                    onChange={toggleAll}
                    className="h-4 w-4 accent-primary"
                  />
                </th>
              )}
              <th className="px-4 py-3 font-medium">{labels.colApplicant}</th>
              <th className="px-4 py-3 font-medium">{labels.colForm}</th>
              <th className="px-4 py-3 font-medium">{labels.colDate}</th>
              <th className="px-4 py-3 font-medium">{labels.colStatus}</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => {
              const status = resolve(s.status);
              return (
                <tr
                  key={s.id}
                  className="border-b border-border/50 transition-colors last:border-0 hover:bg-muted/50"
                >
                  {canReview && (
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        aria-label={`select ${s.applicant}`}
                        checked={selected.has(s.id)}
                        onChange={() => toggle(s.id)}
                        className="h-4 w-4 accent-primary"
                      />
                    </td>
                  )}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {s.avatar && (
                        <img src={s.avatar} alt="" width={24} height={24} className="rounded-full" />
                      )}
                      <span className="text-foreground">{s.applicant}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{s.formTitle}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{s.date}</td>
                  <td className="px-4 py-3">
                    <StatusBadge label={status.label} color={status.color} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/dashboard/${guildId}/submissions/${s.id}` as Route}
                      className="text-sm font-medium text-primary transition-colors hover:underline"
                    >
                      {labels.open}
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
