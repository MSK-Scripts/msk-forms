"use client";

import { useRouter } from "next/navigation";
import { useId, useState, type FormEvent, type ReactNode } from "react";

import {
  ConfirmDialog,
  DataTable,
  FormField,
  FormSection,
  Notice,
  type DataColumn,
} from "@/components/dashboard-kit";
import { CircleNotch, PencilSimple, Trash, UserPlus } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { Dictionary } from "@/i18n";

/** Per-form access a member holds: none, review-only, or full management. */
export type FormAccess = "none" | "review" | "manage";

export interface MemberRow {
  userId: string;
  username: string;
  avatar: string | null;
  role: string;
  /** Per-form access level (absent form id = no access). */
  access: Record<string, "review" | "manage">;
}

type MembersDict = Dictionary["members"];

const ROLE_ORDER: Record<string, number> = { owner: 0, admin: 1, reviewer: 2, viewer: 3 };

const fill = (template: string, values: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? ""));

/** A template with `{name}` as nodes, the name kept out of page translation. */
function withName(template: string, name: string): ReactNode {
  const [before, after] = template.split("{name}");
  return (
    <>
      {before}
      <span translate="no">{name}</span>
      {after}
    </>
  );
}

/**
 * The team of a guild: adding someone by Discord ID, the members with their
 * role, per-form access for viewers and removal. The owner's row cannot be
 * changed; every other row can, by anyone who manages the guild, as the API
 * routes allow. Per-form access opens in a dialog with one labelled select
 * per form, so it stays usable on a phone; each change saves at once.
 */
export function MembersManager({
  guildId,
  members,
  forms,
  teamCount,
  memberLimit,
  t,
  kit,
}: {
  guildId: string;
  members: MemberRow[];
  forms: { id: string; title: string }[];
  teamCount: number;
  memberLimit: number | null;
  t: MembersDict;
  kit: { close: string; dismiss: string };
}) {
  const router = useRouter();
  const teamHeadingId = useId();
  const nameIdPrefix = useId();
  // Where an error belongs: "add" (the add form) or a member's user id.
  const [error, setError] = useState<{ key: string; text: string } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<MemberRow | null>(null);
  const [accessingId, setAccessingId] = useState<string | null>(null);
  const [addId, setAddId] = useState("");
  const [addRole, setAddRole] = useState("viewer");
  // Local per-user, per-form access map, seeded from props.
  const [access, setAccess] = useState<Record<string, Record<string, "review" | "manage">>>(() =>
    Object.fromEntries(members.map((m) => [m.userId, { ...m.access }])),
  );

  const roleLabel: Record<string, string> = {
    owner: t.roleOwner,
    admin: t.roleAdmin,
    reviewer: t.roleReviewer,
    viewer: t.roleViewer,
  };
  const roleOptions = (
    <>
      <option value="viewer">{t.roleViewer}</option>
      <option value="reviewer">{t.roleReviewer}</option>
      <option value="admin">{t.roleAdmin}</option>
    </>
  );
  const nameId = (m: MemberRow) => `${nameIdPrefix}-${m.userId}`;
  const errorFor = (key: string) => (error?.key === key ? error.text : null);
  const accessing = members.find((m) => m.userId === accessingId) ?? null;
  // An error of a row action whose dialog is not open (a role change).
  const rowError =
    error && error.key !== "add" && error.key !== accessingId && error.key !== confirmRemove?.userId
      ? error.text
      : null;

  async function call(url: string, init: RequestInit, key: string) {
    setError(null);
    setBusy(key);
    try {
      const res = await fetch(url, init);
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { code?: string } | null;
        throw new Error(data?.code === "pro_required" ? t.limitReached : t.errAction);
      }
      router.refresh();
      return true;
    } catch (err) {
      setError({ key, text: err instanceof Error ? err.message : t.errAction });
      return false;
    } finally {
      setBusy(null);
    }
  }

  async function addMember(e: FormEvent) {
    e.preventDefault();
    if (busy === "add" || !addId.trim()) return;
    const ok = await call(
      `/api/guilds/${guildId}/members`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ discordId: addId.trim(), role: addRole }),
      },
      "add",
    );
    if (ok) setAddId("");
  }

  function setRole(m: MemberRow, role: string) {
    void call(
      `/api/guilds/${guildId}/members/${m.userId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      },
      m.userId,
    );
  }

  function setFormAccess(m: MemberRow, formId: string, level: FormAccess) {
    const next = { ...(access[m.userId] ?? {}) };
    if (level === "none") delete next[formId];
    else next[formId] = level;
    setAccess((a) => ({ ...a, [m.userId]: next }));
    const grants = Object.entries(next).map(([id, lvl]) => ({
      formId: id,
      manage: lvl === "manage",
    }));
    void call(
      `/api/guilds/${guildId}/members/${m.userId}/forms`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ grants }),
      },
      m.userId,
    );
  }

  async function remove() {
    if (!confirmRemove) return;
    const ok = await call(
      `/api/guilds/${guildId}/members/${confirmRemove.userId}`,
      { method: "DELETE" },
      confirmRemove.userId,
    );
    if (ok) setConfirmRemove(null);
  }

  function accessCell(m: MemberRow) {
    // Per-form grants only matter for viewers: reviewers already see every
    // form, the owner and admins manage every form.
    if (m.role === "owner" || m.role === "admin") {
      return <span className="text-muted-foreground">{t.accessAllManage}</span>;
    }
    if (m.role === "reviewer")
      return <span className="text-muted-foreground">{t.accessAllReview}</span>;
    if (forms.length === 0) return <span className="text-muted-foreground">{t.accessNone}</span>;
    const granted = forms.filter((f) => access[m.userId]?.[f.id]).length;
    return (
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <span className="tabular-nums">
          {fill(t.accessCount, { n: granted, total: forms.length })}
        </span>
        <Button
          size="sm"
          variant="outline"
          aria-haspopup="dialog"
          aria-describedby={nameId(m)}
          disabled={busy === m.userId}
          onClick={() => {
            setError(null);
            setAccessingId(m.userId);
          }}
        >
          <PencilSimple className="h-4 w-4" />
          {t.formAccess}
        </Button>
      </div>
    );
  }

  const columns: DataColumn<MemberRow>[] = [
    {
      id: "member",
      header: t.member,
      sortValue: (m) => m.username.toLowerCase(),
      className: "min-w-[12rem]",
      cell: (m) => (
        <div className="flex items-center gap-3">
          {m.avatar ? (
            <img
              src={m.avatar}
              alt=""
              width={32}
              height={32}
              className="h-8 w-8 shrink-0 rounded-full"
            />
          ) : (
            <span
              aria-hidden
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-small font-semibold text-muted-foreground"
            >
              {m.username.charAt(0).toUpperCase()}
            </span>
          )}
          <span id={nameId(m)} translate="no" className="min-w-0 font-semibold break-words">
            {m.username}
          </span>
        </div>
      ),
    },
    {
      id: "role",
      header: t.role,
      sortValue: (m) => ROLE_ORDER[m.role] ?? 9,
      className: "min-w-[11rem]",
      cell: (m) =>
        m.role === "owner" ? (
          <Badge>{roleLabel.owner}</Badge>
        ) : (
          <Select
            aria-label={fill(t.roleFor, { name: m.username })}
            value={m.role}
            disabled={busy === m.userId}
            onChange={(e) => setRole(m, e.target.value)}
          >
            {roleOptions}
          </Select>
        ),
    },
    {
      id: "access",
      header: t.formAccess,
      className: "min-w-[13rem]",
      cell: accessCell,
    },
    {
      id: "actions",
      header: t.actions,
      nowrap: true,
      cell: (m) =>
        m.role === "owner" ? null : (
          <Button
            size="sm"
            variant="outline"
            className="text-danger"
            aria-describedby={nameId(m)}
            onClick={() => {
              setError(null);
              setConfirmRemove(m);
            }}
          >
            <Trash className="h-4 w-4" />
            {t.remove}
          </Button>
        ),
    },
  ];

  return (
    <>
      <FormSection title={t.addTitle}>
        <form onSubmit={addMember} className="grid gap-5">
          <FormField label={t.discordId} hint={t.idHint}>
            {(field) => (
              <Input
                {...field}
                value={addId}
                inputMode="numeric"
                autoComplete="off"
                spellCheck={false}
                placeholder="123456789012345678"
                onChange={(e) => setAddId(e.target.value)}
                className="max-w-md font-mono"
              />
            )}
          </FormField>
          <FormField label={t.role}>
            {(field) => (
              <Select
                {...field}
                value={addRole}
                onChange={(e) => setAddRole(e.target.value)}
                className="max-w-xs"
              >
                {roleOptions}
              </Select>
            )}
          </FormField>
          <div>
            <Button
              type="submit"
              disabled={busy === "add" || !addId.trim()}
              aria-busy={busy === "add" || undefined}
            >
              {busy === "add" ? (
                <CircleNotch className="h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
              {busy === "add" ? t.adding : t.add}
            </Button>
          </div>
          {errorFor("add") && (
            <Notice
              tone="danger"
              role="alert"
              onDismiss={() => setError(null)}
              dismissLabel={kit.dismiss}
            >
              {errorFor("add")}
            </Notice>
          )}
        </form>
      </FormSection>

      <section aria-labelledby={teamHeadingId} className="grid gap-4 border-t border-border py-6">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h2 id={teamHeadingId} className="font-display text-h3 font-[650]">
            {t.team}
          </h2>
          <p className="text-muted-foreground tabular-nums">
            <span className="font-semibold text-foreground">{teamCount}</span> {t.of}{" "}
            {memberLimit === null ? t.unlimited : memberLimit}
          </p>
        </div>
        {rowError && (
          <Notice
            tone="danger"
            role="alert"
            onDismiss={() => setError(null)}
            dismissLabel={kit.dismiss}
          >
            {rowError}
          </Notice>
        )}
        <DataTable
          caption={t.team}
          captionHidden
          columns={columns}
          rows={members}
          rowKey={(m) => m.userId}
          // Never empty in practice: whoever sees this page is a member.
          empty={null}
        />
      </section>

      <Dialog
        open={accessing !== null}
        onClose={() => setAccessingId(null)}
        title={accessing ? withName(t.accessFor, accessing.username) : t.formAccess}
        description={t.formAccessHint}
        body={
          accessing && (
            <div className="grid gap-4">
              {forms.map((f) => (
                <FormField key={f.id} label={<span translate="no">{f.title}</span>}>
                  {(field) => (
                    <Select
                      {...field}
                      value={access[accessing.userId]?.[f.id] ?? "none"}
                      disabled={busy === accessing.userId}
                      onChange={(e) => setFormAccess(accessing, f.id, e.target.value as FormAccess)}
                    >
                      <option value="none">{t.accessNone}</option>
                      <option value="review">{t.accessReview}</option>
                      <option value="manage">{t.accessManage}</option>
                    </Select>
                  )}
                </FormField>
              ))}
              {errorFor(accessing.userId) && (
                <Notice tone="danger" role="alert">
                  {errorFor(accessing.userId)}
                </Notice>
              )}
            </div>
          )
        }
      >
        <Button variant="outline" onClick={() => setAccessingId(null)}>
          {kit.close}
        </Button>
      </Dialog>

      <ConfirmDialog
        open={confirmRemove !== null}
        onClose={() => {
          if (busy !== null) return;
          setError(null);
          setConfirmRemove(null);
        }}
        onConfirm={remove}
        title={confirmRemove ? withName(t.removeNamed, confirmRemove.username) : t.remove}
        description={t.removeConfirm}
        confirmLabel={
          confirmRemove ? fill(t.removeNamed, { name: confirmRemove.username }) : t.remove
        }
        cancelLabel={t.cancel}
        busy={busy !== null}
        error={confirmRemove ? errorFor(confirmRemove.userId) : null}
      />
    </>
  );
}
