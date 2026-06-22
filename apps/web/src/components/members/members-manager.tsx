"use client";

import { Button, Card, Checkbox, Field, Input, Select } from "@msk-forms/ui";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { ConfirmDialog } from "@/components/confirm-dialog";
import type { Dictionary } from "@/i18n";

export interface MemberRow {
  userId: string;
  username: string;
  avatar: string | null;
  role: string;
  formIds: string[];
}

type MembersDict = Dictionary["members"];

export function MembersManager({
  guildId,
  members,
  forms,
  teamCount,
  memberLimit,
  t,
}: {
  guildId: string;
  members: MemberRow[];
  forms: { id: string; title: string }[];
  teamCount: number;
  memberLimit: number | null;
  t: MembersDict;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<MemberRow | null>(null);
  const [addId, setAddId] = useState("");
  const [addRole, setAddRole] = useState("viewer");
  // Local per-user form selection, seeded from props.
  const [grants, setGrants] = useState<Record<string, Set<string>>>(
    () => Object.fromEntries(members.map((m) => [m.userId, new Set(m.formIds)])),
  );

  const roleLabel: Record<string, string> = {
    owner: t.roleOwner,
    admin: t.roleAdmin,
    reviewer: t.roleReviewer,
    viewer: t.roleViewer,
  };

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
      setError(err instanceof Error ? err.message : t.errAction);
      return false;
    } finally {
      setBusy(null);
    }
  }

  async function addMember() {
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
      { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role }) },
      m.userId,
    );
  }

  function toggleForm(m: MemberRow, formId: string) {
    const next = new Set(grants[m.userId] ?? []);
    if (next.has(formId)) next.delete(formId);
    else next.add(formId);
    setGrants((g) => ({ ...g, [m.userId]: next }));
    void call(
      `/api/guilds/${guildId}/members/${m.userId}/forms`,
      { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ formIds: [...next] }) },
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

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex flex-col gap-4 p-5">
        <div className="flex flex-col gap-1">
          <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {t.addTitle}
          </h3>
          <p className="text-xs text-muted-foreground">{t.idHint}</p>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <Field label={t.discordId}>
            <Input
              value={addId}
              placeholder="123456789012345678"
              onChange={(e) => setAddId(e.target.value)}
            />
          </Field>
          <Select
            value={addRole}
            onChange={(e) => setAddRole(e.target.value)}
            options={[
              { value: "viewer", label: t.roleViewer },
              { value: "reviewer", label: t.roleReviewer },
              { value: "admin", label: t.roleAdmin },
            ]}
          />
          <Button type="button" onClick={addMember} disabled={busy === "add" || !addId.trim()}>
            {busy === "add" ? t.adding : t.add}
          </Button>
        </div>
      </Card>

      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {t.team}: {teamCount} {t.of} {memberLimit === null ? t.unlimited : memberLimit}
      </p>

      <Card className="flex flex-col divide-y divide-border p-0">
        {members.map((m) => (
          <div key={m.userId} className="flex flex-col gap-3 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {m.avatar ? (
                  <img src={m.avatar} alt="" width={32} height={32} className="rounded-full" />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                    {m.username.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="font-medium text-foreground">{m.username}</span>
              </div>

              {m.role === "owner" ? (
                <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  {roleLabel.owner}
                </span>
              ) : (
                <div className="flex items-center gap-2">
                  <Select
                    value={m.role}
                    disabled={busy === m.userId}
                    onChange={(e) => setRole(m, e.target.value)}
                    options={[
                      { value: "viewer", label: roleLabel.viewer! },
                      { value: "reviewer", label: roleLabel.reviewer! },
                      { value: "admin", label: roleLabel.admin! },
                    ]}
                  />
                  <Button variant="ghost" onClick={() => setConfirmRemove(m)}>
                    {t.remove}
                  </Button>
                </div>
              )}
            </div>

            {/* Per-form reviewer grants only matter for viewers (reviewers see all). */}
            {m.role === "viewer" && forms.length > 0 && (
              <div className="flex flex-col gap-2 rounded-md border border-border bg-muted/30 p-3">
                <p className="text-xs font-medium text-foreground">{t.formAccess}</p>
                <p className="text-xs text-muted-foreground">{t.formAccessHint}</p>
                <div className="flex flex-col gap-1.5">
                  {forms.map((f) => (
                    <Checkbox
                      key={f.id}
                      id={`${m.userId}-${f.id}`}
                      label={f.title}
                      checked={grants[m.userId]?.has(f.id) ?? false}
                      disabled={busy === m.userId}
                      onChange={() => toggleForm(m, f.id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </Card>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <ConfirmDialog
        open={confirmRemove !== null}
        title={t.remove}
        message={t.removeConfirm}
        confirmLabel={t.remove}
        cancelLabel={t.cancel}
        busy={busy !== null}
        onConfirm={remove}
        onCancel={() => setConfirmRemove(null)}
      />
    </div>
  );
}
