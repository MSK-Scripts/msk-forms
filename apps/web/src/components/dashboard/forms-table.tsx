"use client";

import type { Route } from "next";
import Link from "next/link";
import { useState, type ReactNode } from "react";

import {
  DataTable,
  RowMenu,
  StatusBadge,
  type CopyFieldCopy,
  type DataColumn,
  type RowMenuItem,
} from "@/components/dashboard-kit";
import {
  Archive,
  ChartBar,
  DownloadSimple,
  Eye,
  HourglassMedium,
  PencilSimple,
  QrCode,
  UploadSimple,
} from "@/components/icons";
import { LocalDateTime } from "@/components/public/local-datetime";
import { Button } from "@/components/ui/button";

import { FormActionDialog, type FormActionCopy } from "./form-action-button";
import { FormStateBadge, type FormStatus } from "./form-state-badge";
import { useReplaceFromJson } from "./form-io";
import { ShareDialog, type ShareLabels } from "./share-button";

export interface FormRow {
  id: string;
  title: string;
  slug: string;
  status: FormStatus;
  endingSoon: boolean;
  openAt: string | null;
  closeAt: string | null;
  submissions: number;
  /** Public address while the form is live. */
  url: string | null;
  qr: string | null;
  /** May edit, preview and archive this form (manager or per-form manage grant). */
  manages: boolean;
  /** An A/B test runs on it and the viewer manages the guild. */
  experiment: boolean;
}

export interface FormsTableCopy {
  caption: string;
  form: string;
  status: string;
  submissions: string;
  actions: string;
  moreFor: string;
  statusLabel: Record<FormStatus, string>;
  endingSoon: string;
  opensAt: string;
  closesAt: string;
  noLink: string;
  edit: string;
  preview: string;
  share: ShareLabels;
  shareTitle: string;
  qrAlt: string;
  close: string;
  copyField: CopyFieldCopy;
  submissionsAs: string;
  definition: string;
  abResults: string;
  archive: FormActionCopy;
  replace: {
    replace: string;
    replaceTitle: string;
    replaceConfirm: string;
    cancel: string;
    importErr: string;
  };
}

const fill = (template: string, values: Record<string, string>) =>
  template.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? "");

/**
 * The forms of a guild. Edit is the one action in the row; the rest (preview,
 * share, exports, replacing from JSON, the A/B results, archive) sit in the
 * row's menu. What a person may do follows the flags of each row, which the
 * page set from the same checks the API routes make.
 */
export function FormsTable({
  guildId,
  rows,
  isPro,
  canManage,
  empty,
  copy,
}: {
  guildId: string;
  rows: FormRow[];
  isPro: boolean;
  /** Guild manager: may replace a form from JSON (Pro). */
  canManage: boolean;
  empty: ReactNode;
  copy: FormsTableCopy;
}) {
  const [sharing, setSharing] = useState<FormRow | null>(null);
  const [archiving, setArchiving] = useState<FormRow | null>(null);
  const replace = useReplaceFromJson(guildId, copy.replace);
  const formats = isPro ? ["csv", "xlsx", "json", "pdf"] : ["csv"];

  function menu(form: FormRow): RowMenuItem[] {
    const base = `/api/guilds/${guildId}/forms/${form.id}`;
    const items: RowMenuItem[] = [];
    if (form.manages) {
      items.push({
        id: "preview",
        label: copy.preview,
        icon: Eye,
        external: `/dashboard/${guildId}/forms/${form.id}/preview`,
      });
    }
    if (form.url) {
      items.push({
        id: "share",
        label: copy.share.share,
        icon: QrCode,
        onSelect: () => setSharing(form),
      });
    }
    if (form.manages && form.experiment) {
      items.push({
        id: "ab",
        label: copy.abResults,
        icon: ChartBar,
        href: `/dashboard/${guildId}/forms/${form.id}/experiment`,
      });
    }
    if (form.submissions > 0) {
      for (const format of formats) {
        items.push({
          id: `export-${format}`,
          label: fill(copy.submissionsAs, { format: format.toUpperCase() }),
          icon: DownloadSimple,
          download: `${base}/export?format=${format}`,
        });
      }
    }
    if (form.manages && isPro) {
      items.push({
        id: "definition",
        label: copy.definition,
        icon: DownloadSimple,
        download: `${base}/definition`,
      });
    }
    if (canManage && isPro) {
      items.push({
        id: "replace",
        label: copy.replace.replace,
        icon: UploadSimple,
        onSelect: () => replace.pick(form.id),
      });
    }
    if (form.manages) {
      items.push({
        id: "archive",
        label: copy.archive.label,
        icon: Archive,
        onSelect: () => setArchiving(form),
      });
    }
    return items;
  }

  const columns: DataColumn<FormRow>[] = [
    {
      id: "title",
      header: copy.form,
      sortValue: (f) => f.title.toLowerCase(),
      className: "min-w-[14rem]",
      cell: (f) => (
        // A long title wraps instead of widening the column; on a phone it
        // would otherwise run under the sticky action column, cut off.
        <div className="grid max-w-[14rem] sm:max-w-[24rem]">
          {f.manages ? (
            <Link
              href={`/dashboard/${guildId}/forms/${f.id}/edit` as Route}
              prefetch={false}
              className="inline-flex min-h-9 w-fit max-w-full items-center font-semibold [overflow-wrap:anywhere] text-foreground hover:text-primary hover:underline"
            >
              {f.title}
            </Link>
          ) : (
            <span className="font-semibold [overflow-wrap:anywhere]">{f.title}</span>
          )}
          {f.url ? (
            <a
              href={f.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-9 w-fit items-center font-mono text-small break-all text-primary hover:underline"
            >
              /f/{f.slug}
            </a>
          ) : (
            <span className="text-small text-muted-foreground">{copy.noLink}</span>
          )}
          {(f.openAt || f.closeAt) && (
            <span className="text-small text-muted-foreground">
              {f.openAt && (
                <>
                  {copy.opensAt} <LocalDateTime iso={f.openAt} />
                </>
              )}
              {f.openAt && f.closeAt && " · "}
              {f.closeAt && (
                <>
                  {copy.closesAt} <LocalDateTime iso={f.closeAt} />
                </>
              )}
            </span>
          )}
        </div>
      ),
    },
    {
      id: "status",
      header: copy.status,
      sortValue: (f) => copy.statusLabel[f.status],
      cell: (f) => (
        <div className="flex flex-wrap gap-1.5">
          <FormStateBadge status={f.status} label={copy.statusLabel[f.status]} />
          {f.endingSoon && (
            <StatusBadge tone="warning" icon={HourglassMedium}>
              {copy.endingSoon}
            </StatusBadge>
          )}
        </div>
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
      sticky: true,
      header: <span className="sr-only">{copy.actions}</span>,
      nowrap: true,
      className: "text-right",
      cell: (f) => {
        const items = menu(f);
        return (
          <div className="flex items-center justify-end gap-2">
            {f.manages && (
              <Button asChild size="sm" variant="outline">
                <Link href={`/dashboard/${guildId}/forms/${f.id}/edit` as Route} prefetch={false}>
                  <PencilSimple className="h-4 w-4" />
                  {copy.edit}
                  <span className="sr-only">: {f.title}</span>
                </Link>
              </Button>
            )}
            {items.length > 0 && (
              <RowMenu label={fill(copy.moreFor, { name: f.title })} items={items} />
            )}
          </div>
        );
      },
    },
  ];

  return (
    <>
      <DataTable
        caption={copy.caption}
        captionHidden
        columns={columns}
        rows={rows}
        rowKey={(f) => f.id}
        empty={empty}
      />
      {sharing?.url && (
        <ShareDialog
          open
          onClose={() => setSharing(null)}
          title={fill(copy.shareTitle, { name: sharing.title })}
          url={sharing.url}
          qrDataUrl={sharing.qr}
          qrAlt={fill(copy.qrAlt, { url: sharing.url })}
          closeLabel={copy.close}
          t={copy.share}
          copy={copy.copyField}
        />
      )}
      {archiving && (
        <FormActionDialog
          open
          onClose={() => setArchiving(null)}
          request={{
            url: `/api/guilds/${guildId}/forms/${archiving.id}/archive`,
            method: "POST",
            body: { archived: true },
          }}
          t={copy.archive}
        />
      )}
      {replace.node}
    </>
  );
}
