"use client";

import { verificationRecordName, verificationRecordValue } from "@msk-forms/shared";
import { Button, Card, Field, Input } from "@msk-forms/ui";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { ConfirmDialog } from "@/components/confirm-dialog";
import type { Dictionary } from "@/i18n";

type DomainDict = Dictionary["domain"];

export function DomainForm({
  guildId,
  cnameTarget,
  initial,
  t,
}: {
  guildId: string;
  cnameTarget: string;
  initial: { domain: string; token: string; verified: boolean };
  t: DomainDict;
}) {
  const router = useRouter();
  const [domain, setDomain] = useState(initial.domain);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verifyMsg, setVerifyMsg] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState(false);

  const records =
    initial.domain && initial.token
      ? {
          cnameName: initial.domain,
          txtName: verificationRecordName(initial.domain),
          txtValue: verificationRecordValue(initial.token),
        }
      : null;

  async function save() {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/guilds/${guildId}/domain`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: domain.trim() }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? t.errSave);
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errSave);
    } finally {
      setBusy(false);
    }
  }

  async function verify() {
    setError(null);
    setVerifyMsg(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/guilds/${guildId}/domain/verify`, { method: "POST" });
      const data = (await res.json().catch(() => null)) as { verified?: boolean } | null;
      if (data?.verified) router.refresh();
      else setVerifyMsg(t.verifyFailed);
    } catch {
      setVerifyMsg(t.verifyFailed);
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setBusy(true);
    try {
      await fetch(`/api/guilds/${guildId}/domain`, { method: "DELETE" });
      setDomain("");
      setConfirmRemove(false);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="flex flex-col gap-4 p-5">
      <Field label={t.label}>
        <div className="flex gap-2">
          <Input
            value={domain}
            placeholder={t.placeholder}
            onChange={(e) => setDomain(e.target.value)}
          />
          <Button
            type="button"
            onClick={save}
            disabled={busy || !domain.trim() || domain.trim() === initial.domain}
          >
            {busy ? t.saving : t.save}
          </Button>
        </div>
      </Field>

      {records && (
        <div className="flex flex-col gap-4 border-t border-border pt-4">
          <Record label={t.step1}>
            <Row name={t.recordName} value={records.cnameName} />
            <Row name="CNAME" value={`→ ${cnameTarget}`} />
          </Record>
          <Record label={t.step2}>
            <Row name={t.recordName} value={records.txtName} />
            <Row name="TXT" value={records.txtValue} />
          </Record>

          <div className="flex flex-wrap items-center gap-3">
            {initial.verified ? (
              <span className="text-sm font-medium text-primary">✓ {t.verified}</span>
            ) : (
              <>
                <Button type="button" onClick={verify} disabled={busy}>
                  {busy ? t.verifying : t.verify}
                </Button>
                <span className="text-sm text-muted-foreground">{t.pending}</span>
              </>
            )}
            <button
              type="button"
              onClick={() => setConfirmRemove(true)}
              className="ml-auto text-sm font-medium text-muted-foreground transition-colors hover:text-destructive"
            >
              {t.remove}
            </button>
          </div>

          {!initial.verified && <p className="text-xs text-muted-foreground">{t.propagation}</p>}
          {verifyMsg && <p className="text-sm text-destructive">{verifyMsg}</p>}
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <ConfirmDialog
        open={confirmRemove}
        title={t.remove}
        message={t.removeConfirm}
        confirmLabel={t.remove}
        cancelLabel={t.cancel}
        busy={busy}
        onConfirm={remove}
        onCancel={() => setConfirmRemove(false)}
      />
    </Card>
  );
}

function Record({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-sm font-medium text-foreground">{label}</p>
      <div className="flex flex-col gap-1 rounded-md border border-border bg-muted/40 p-3">
        {children}
      </div>
    </div>
  );
}

function Row({ name, value }: { name: string; value: string }) {
  return (
    <div className="flex flex-wrap items-baseline gap-2 text-xs">
      <span className="w-16 shrink-0 font-medium uppercase tracking-wide text-muted-foreground">
        {name}
      </span>
      <code className="break-all font-mono text-foreground">{value}</code>
    </div>
  );
}
