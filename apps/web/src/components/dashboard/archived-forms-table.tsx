"use client";

import { useState, type ReactNode } from "react";

import { DataTable, RowMenu, type DataColumn, type RowMenuItem } from "@/components/dashboard-kit";
import { ArrowCounterClockwise, Trash, Tray } from "@/components/icons";
import { LocalDateTime } from "@/components/public/local-datetime";
import { Button } from "@/components/ui/button";

import { FormActionDialog, type FormActionCopy } from "./form-action-button";

export interface ArchivedFormRow {
  id: string;
  title: string;
  archivedAt: string | null;
  archivedBy: string | null;
  submissions: number;
  /** May open the form's submissions (reviews it). */
  mayReview: boolean;
}

/**
 * The archived forms of a guild. Restore is the row's action; viewing the
 * submissions and deleting for good sit in its menu. Deleting asks for the
 * form's name, because it cannot be undone.
 */
export function ArchivedFormsTable({
  guildId,
  rows,
  mayDelete,
  empty,
  copy,
}: {
  guildId: string;
  rows: ArchivedFormRow[];
  /** Owner, or an admin the owner allowed: may delete for good. */
  mayDelete: boolean;
  empty: ReactNode;
  copy: {
    caption: string;
    form: string;
    archived: string;
    by: string;
    submissions: string;
    actions: string;
    moreFor: string;
    viewSubmissions: string;
    typeName: string;
    restore: FormActionCopy;
    remove: FormActionCopy;
  };
}) {
  const [restoring, setRestoring] = useState<ArchivedFormRow | null>(null);
  const [removing, setRemoving] = useState<ArchivedFormRow | null>(null);

  const columns: DataColumn<ArchivedFormRow>[] = [
    {
      id: "title",
      header: copy.form,
      sortValue: (f) => f.title.toLowerCase(),
      className: "min-w-[12rem] font-semibold",
      cell: (f) => f.title,
    },
    {
      id: "archived",
      header: copy.archived,
      sortValue: (f) => f.archivedAt,
      cell: (f) => (
        <span className="grid gap-0.5">
          {f.archivedAt && <LocalDateTime iso={f.archivedAt} />}
          {f.archivedBy && (
            <span className="text-muted-foreground">
              {copy.by} <span translate="no">{f.archivedBy}</span>
            </span>
          )}
        </span>
      ),
    },
    {
      id: "submissions",
      header: copy.submissions,
      numeric: true,
      sortValue: (f) => f.submissions,
      cell: (f) => f.submissions,
    },
    {
      id: "actions",
      header: <span className="sr-only">{copy.actions}</span>,
      nowrap: true,
      cell: (f) => {
        const items: RowMenuItem[] = [];
        if (f.submissions > 0 && f.mayReview) {
          items.push({
            id: "submissions",
            label: copy.viewSubmissions,
            icon: Tray,
            href: `/dashboard/${guildId}/forms/archived/${f.id}`,
          });
        }
        if (mayDelete) {
          items.push({ id: "delete", label: copy.remove.label, icon: Trash, danger: true, onSelect: () => setRemoving(f) });
        }
        return (
          <div className="flex items-center justify-end gap-2">
            <Button size="sm" variant="outline" onClick={() => setRestoring(f)}>
              <ArrowCounterClockwise className="h-4 w-4" />
              {copy.restore.label}
              <span className="sr-only">: {f.title}</span>
            </Button>
            {items.length > 0 && (
              <RowMenu label={copy.moreFor.replace("{name}", f.title)} items={items} />
            )}
          </div>
        );
      },
    },
  ];

  return (
    <>
      <DataTable caption={copy.caption} captionHidden columns={columns} rows={rows} rowKey={(f) => f.id} empty={empty} />
      {restoring && (
        <FormActionDialog
          open
          onClose={() => setRestoring(null)}
          request={{ url: `/api/guilds/${guildId}/forms/${restoring.id}/archive`, method: "POST", body: { archived: false } }}
          t={copy.restore}
        />
      )}
      {removing && (
        <FormActionDialog
          open
          onClose={() => setRemoving(null)}
          request={{ url: `/api/guilds/${guildId}/forms/${removing.id}`, method: "DELETE" }}
          tone="danger"
          typeToConfirm={{ expected: removing.title.trim(), label: copy.typeName }}
          t={copy.remove}
        />
      )}
    </>
  );
}

