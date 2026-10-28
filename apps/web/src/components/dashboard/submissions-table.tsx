"use client";

import { SubmissionStatusBadge } from "@msk-forms/ui";
import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, type ReactNode } from "react";

import { DataTable, FormField, Notice, type DataColumn } from "@/components/dashboard-kit";
import { Archive, ArrowCounterClockwise } from "@/components/icons";
import { LocalDateTime } from "@/components/public/local-datetime";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { dotColors } from "@/lib/color-dot";

export interface SubmissionRow {
  id: string;
  /** Discord username; null for an anonymous submission. */
  applicant: string | null;
  avatar: string | null;
  formId: string;
  formTitle: string;
  /** ISO timestamp of the submission. */
  submittedAt: string;
  status: string;
  score: number | null;
}

export interface StatusOption {
  key: string;
  label: string;
  color: string;
}

export interface SubmissionsTableLabels {
  caption: string;
  colApplicant: string;
  colForm: string;
  colDate: string;
  colStatus: string;
  colScore: string;
  actions: string;
  anonymous: string;
  notScored: string;
  open: string;
  archive: string;
  restore: string;
  archivedOne: string;
  restoredOne: string;
  selectAll: string;
  selectOne: string;
  selected: string;
  bulkLabel: string;
  clearSelection: string;
  apply: string;
  applying: string;
  moveTo: string;
  bulkDone: string;
  bulkFailed: string;
  allForms: string;
  dismiss: string;
}

const fill = (template: string, values: Record<string, string>) =>
  template.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? "");

type Result = { tone: "success" | "danger"; text: string };

/**
 * The working list of a guild's submissions: a form filter, selection with a
 * bulk status change, and per row Open plus Archive (Restore in the archived
 * view). Archiving is undone by restoring, so it does not ask first.
 *
 * After an action the row may leave the list, so the focus moves to the
 * result message instead of falling back to the top of the page.
 */
export function SubmissionsTable({
  guildId,
  rows,
  options,
  canReview,
  archived = false,
  empty,
  labels,
}: {
  guildId: string;
  rows: SubmissionRow[];
  options: StatusOption[];
  canReview: boolean;
  /** When true this is the archived view: the row action restores instead of archives. */
  archived?: boolean;
  /** The EmptyState for no rows. */
  empty: ReactNode;
  labels: SubmissionsTableLabels;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState(options[0]?.key ?? "");
  const [applying, setApplying] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [formFilter, setFormFilter] = useState("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // Distinct forms present in the current submissions, for the filter dropdown.
  const forms = [...new Map(rows.map((r) => [r.formId, r.formTitle])).entries()]
    .map(([id, title]) => ({ id, title }))
    .sort((a, b) => a.title.localeCompare(b.title));
  const visibleRows = formFilter === "all" ? rows : rows.filter((r) => r.formId === formFilter);

  const selectedVisible = visibleRows.filter((r) => selected.has(r.id)).length;
  const allSelected = visibleRows.length > 0 && selectedVisible === visibleRows.length;
  const hasScores = visibleRows.some((r) => r.score != null);
  const name = (r: SubmissionRow) => r.applicant ?? labels.anonymous;

  // Changing the filter clears the selection so bulk actions never touch hidden rows.
  function changeFilter(value: string) {
    setFormFilter(value);
    setSelected(new Set());
  }
  const resolve = (key: string): { label: string; color?: string } =>
    options.find((o) => o.key === key) ?? { label: key };

  function toggle(id: string) {
    setResult(null);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  function toggleAll() {
    setResult(null);
    setSelected(allSelected ? new Set() : new Set(visibleRows.map((r) => r.id)));
  }

  function report(next: Result) {
    setResult(next);
    // After the commit, so the message exists to take the focus.
    requestAnimationFrame(() => resultRef.current?.focus());
  }

  async function setArchived(row: SubmissionRow, value: boolean) {
    setResult(null);
    setBusyId(row.id);
    try {
      const res = await fetch(`/api/guilds/${guildId}/submissions/${row.id}/archive`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived: value }),
      });
      if (!res.ok) throw new Error(labels.bulkFailed);
      setSelected((prev) => {
        const next = new Set(prev);
        next.delete(row.id);
        return next;
      });
      report({
        tone: "success",
        text: fill(value ? labels.archivedOne : labels.restoredOne, { name: name(row) }),
      });
      router.refresh();
    } catch (err) {
      report({ tone: "danger", text: err instanceof Error ? err.message : labels.bulkFailed });
    } finally {
      setBusyId(null);
    }
  }

  async function apply() {
    setResult(null);
    setApplying(true);
    try {
      const res = await fetch(`/api/guilds/${guildId}/submissions/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [...selected], status: bulkStatus }),
      });
      if (!res.ok) throw new Error(labels.bulkFailed);
      setSelected(new Set());
      report({
        tone: "success",
        text: fill(labels.bulkDone, { status: resolve(bulkStatus).label }),
      });
      router.refresh();
    } catch (err) {
      report({ tone: "danger", text: err instanceof Error ? err.message : labels.bulkFailed });
    } finally {
      setApplying(false);
    }
  }

  const columns: DataColumn<SubmissionRow>[] = [
    ...(canReview
      ? [
          {
            id: "select",
            header: (
              <label className="inline-flex min-h-9 min-w-9 items-center justify-center">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = selectedVisible > 0 && !allSelected;
                  }}
                  onChange={toggleAll}
                  disabled={visibleRows.length === 0}
                  className="h-5 w-5 accent-primary"
                />
                <span className="sr-only">{labels.selectAll}</span>
              </label>
            ),
            className: "w-12 align-middle",
            cell: (r: SubmissionRow) => (
              <label className="inline-flex min-h-9 min-w-9 items-center justify-center">
                <input
                  type="checkbox"
                  checked={selected.has(r.id)}
                  onChange={() => toggle(r.id)}
                  className="h-5 w-5 accent-primary"
                />
                <span className="sr-only">{fill(labels.selectOne, { name: name(r) })}</span>
              </label>
            ),
          },
        ]
      : []),
    {
      id: "applicant",
      header: labels.colApplicant,
      sortValue: (r) => name(r).toLowerCase(),
      className: "min-w-[12rem] align-middle",
      cell: (r) => (
        <span className="flex items-center gap-2.5">
          {r.avatar && (
            <img
              src={r.avatar}
              alt=""
              width={28}
              height={28}
              className="h-7 w-7 shrink-0 rounded-full"
            />
          )}
          <Link
            href={`/dashboard/${guildId}/submissions/${r.id}` as Route}
            prefetch={false}
            translate={r.applicant ? "no" : undefined}
            className="inline-flex min-h-9 items-center font-semibold text-foreground hover:text-primary hover:underline"
          >
            {name(r)}
          </Link>
        </span>
      ),
    },
    {
      id: "form",
      header: labels.colForm,
      sortValue: (r) => r.formTitle.toLowerCase(),
      className: "min-w-[10rem] align-middle",
      cell: (r) => <span translate="no">{r.formTitle}</span>,
    },
    {
      id: "date",
      header: labels.colDate,
      sortValue: (r) => r.submittedAt,
      nowrap: true,
      className: "align-middle tabular-nums",
      cell: (r) => <LocalDateTime iso={r.submittedAt} />,
    },
    ...(hasScores
      ? [
          {
            id: "score",
            header: labels.colScore,
            numeric: true,
            nowrap: true,
            className: "align-middle",
            sortValue: (r: SubmissionRow) => r.score,
            cell: (r: SubmissionRow) =>
              r.score != null ? (
                <span className="font-semibold">{r.score}</span>
              ) : (
                <span className="text-muted-foreground">{labels.notScored}</span>
              ),
          },
        ]
      : []),
    {
      id: "status",
      header: labels.colStatus,
      sortValue: (r) => resolve(r.status).label,
      nowrap: true,
      className: "align-middle",
      cell: (r) => {
        const status = resolve(r.status);
        return <SubmissionStatusBadge label={status.label} {...dotColors(status.color)} />;
      },
    },
    {
      id: "actions",
      header: <span className="sr-only">{labels.actions}</span>,
      nowrap: true,
      className: "align-middle text-right",
      cell: (r) => (
        <div className="flex items-center justify-end gap-2">
          <Button asChild size="sm" variant="outline">
            <Link href={`/dashboard/${guildId}/submissions/${r.id}` as Route} prefetch={false}>
              {labels.open}
              <span className="sr-only">: {name(r)}</span>
            </Link>
          </Button>
          {canReview && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setArchived(r, !archived)}
              disabled={busyId === r.id}
              aria-busy={busyId === r.id || undefined}
            >
              {archived ? (
                <ArrowCounterClockwise className="h-4 w-4" />
              ) : (
                <Archive className="h-4 w-4" />
              )}
              {archived ? labels.restore : labels.archive}
              <span className="sr-only">: {name(r)}</span>
            </Button>
          )}
        </div>
      ),
    },
  ];

  const showBulk = canReview && rows.length > 0;

  return (
    <div className="grid gap-4">
      {(forms.length > 1 || showBulk) && (
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          {forms.length > 1 && (
            <FormField label={labels.colForm} className="w-full max-w-[20rem]">
              {(field) => (
                <Select
                  {...field}
                  value={formFilter}
                  onChange={(e) => changeFilter(e.target.value)}
                >
                  <option value="all">{labels.allForms}</option>
                  {forms.map((f) => (
                    <option key={f.id} value={f.id} translate="no">
                      {f.title}
                    </option>
                  ))}
                </Select>
              )}
            </FormField>
          )}

          {showBulk && (
            <div
              role="group"
              aria-label={labels.bulkLabel}
              className="flex flex-wrap items-end gap-3"
            >
              <p className="flex min-h-11 items-center font-semibold tabular-nums">
                {selected.size} {labels.selected}
              </p>
              <FormField label={labels.moveTo} className="min-w-[12rem]">
                {(field) => (
                  <Select
                    {...field}
                    value={bulkStatus}
                    onChange={(e) => setBulkStatus(e.target.value)}
                  >
                    {options.map((o) => (
                      <option key={o.key} value={o.key}>
                        {o.label}
                      </option>
                    ))}
                  </Select>
                )}
              </FormField>
              <Button
                onClick={apply}
                disabled={applying || selected.size === 0}
                aria-busy={applying || undefined}
              >
                {applying ? labels.applying : labels.apply}
              </Button>
              {selected.size > 0 && (
                <Button variant="link" className="min-h-11" onClick={() => setSelected(new Set())}>
                  {labels.clearSelection}
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {result && (
        <div ref={resultRef} tabIndex={-1}>
          <Notice
            tone={result.tone}
            title={result.text}
            role={result.tone === "danger" ? "alert" : "status"}
            onDismiss={() => setResult(null)}
            dismissLabel={labels.dismiss}
          />
        </div>
      )}

      <DataTable
        caption={labels.caption}
        captionHidden
        columns={columns}
        rows={visibleRows}
        rowKey={(r) => r.id}
        empty={empty}
        initialSort={{ column: "date", direction: "desc" }}
      />
    </div>
  );
}
