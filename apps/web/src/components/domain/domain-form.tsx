"use client";

import { verificationRecordName, verificationRecordValue } from "@msk-forms/shared";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  ConfirmDialog,
  CopyField,
  FormField,
  Notice,
  SectionCard,
  StatusBadge,
  type CopyFieldCopy,
} from "@/components/dashboard-kit";
import { Clock, Trash } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Dictionary } from "@/i18n";

type DomainDict = Dictionary["domain"];

/**
 * The guild's own domain: the domain, the two DNS records to copy, the check
 * and the verification state as a badge (verified, pending, check failed).
 * Removing it drops the token, so using the domain again means new records and
 * a new check; the confirmation asks to type the domain.
 */
export function DomainForm({
  guildId,
  cnameTarget,
  initial,
  t,
  copy,
}: {
  guildId: string;
  cnameTarget: string;
  initial: { domain: string; token: string; verified: boolean };
  t: DomainDict;
  copy: CopyFieldCopy;
}) {
  const router = useRouter();
  const [domain, setDomain] = useState(initial.domain);
  const [busy, setBusy] = useState<"save" | "verify" | "remove" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [verifyMsg, setVerifyMsg] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [removeError, setRemoveError] = useState<string | null>(null);

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
    setBusy("save");
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
      setBusy(null);
    }
  }

  async function verify() {
    setError(null);
    setVerifyMsg(null);
    setBusy("verify");
    try {
      const res = await fetch(`/api/guilds/${guildId}/domain/verify`, { method: "POST" });
      const data = (await res.json().catch(() => null)) as { verified?: boolean } | null;
      if (data?.verified) router.refresh();
      else setVerifyMsg(t.verifyFailed);
    } catch {
      setVerifyMsg(t.verifyFailed);
    } finally {
      setBusy(null);
    }
  }

  async function remove() {
    setRemoveError(null);
    setBusy("remove");
    try {
      const res = await fetch(`/api/guilds/${guildId}/domain`, { method: "DELETE" });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? t.errRemove);
      }
      setDomain("");
      setConfirmRemove(false);
      router.refresh();
    } catch (err) {
      // The dialog stays open with the reason, so the domain is not shown as gone.
      setRemoveError(err instanceof Error ? err.message : t.errRemove);
    } finally {
      setBusy(null);
    }
  }

  const badge = !records ? undefined : initial.verified ? (
    <StatusBadge tone="success">{t.statusVerified}</StatusBadge>
  ) : verifyMsg ? (
    <StatusBadge tone="danger">{t.statusFailed}</StatusBadge>
  ) : (
    <StatusBadge tone="warning" icon={Clock}>
      {t.statusPending}
    </StatusBadge>
  );

  return (
    <SectionCard title={t.title} description={t.intro} actions={badge}>
      <div className="grid gap-6">
        <div className="flex flex-wrap items-end gap-3">
          <FormField label={t.label} className="min-w-0 flex-1 basis-64">
            {(field) => (
              <Input
                {...field}
                value={domain}
                placeholder={t.placeholder}
                onChange={(e) => setDomain(e.target.value)}
                inputMode="url"
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
                className="font-mono"
              />
            )}
          </FormField>
          <Button
            variant={records ? "outline" : "primary"}
            onClick={save}
            disabled={busy !== null || !domain.trim() || domain.trim() === initial.domain}
            aria-busy={busy === "save" || undefined}
          >
            {busy === "save" ? t.saving : t.save}
          </Button>
        </div>

        {error && <Notice tone="danger" role="alert" title={error} />}

        {records && (
          <div className="grid gap-6 border-t border-border pt-6">
            <div className="grid gap-3">
              <h3 className="font-semibold">{t.step1}</h3>
              <div className="grid gap-4 @3xl:grid-cols-2">
                <CopyField label={t.recordName} value={records.cnameName} copy={copy} />
                <CopyField label={t.target} value={cnameTarget} copy={copy} />
              </div>
            </div>
            <div className="grid gap-3">
              <h3 className="font-semibold">{t.step2}</h3>
              <div className="grid gap-4 @3xl:grid-cols-2">
                <CopyField label={t.recordName} value={records.txtName} copy={copy} />
                <CopyField label={t.recordValue} value={records.txtValue} copy={copy} />
              </div>
            </div>

            {initial.verified ? (
              <Notice tone="success" title={t.verified} />
            ) : (
              <div className="grid justify-items-start gap-3">
                <p className="max-w-[65ch]">{t.pending}</p>
                <p className="max-w-[65ch] text-small text-muted-foreground">{t.propagation}</p>
                <Button
                  onClick={verify}
                  disabled={busy !== null}
                  aria-busy={busy === "verify" || undefined}
                >
                  {busy === "verify" ? t.verifying : t.verify}
                </Button>
              </div>
            )}
            {verifyMsg && <Notice tone="danger" role="alert" title={verifyMsg} />}

            <div className="border-t border-border pt-6">
              <Button
                variant="outline"
                onClick={() => setConfirmRemove(true)}
                disabled={busy !== null}
                className="text-danger"
              >
                <Trash className="h-4 w-4" />
                {t.remove}
              </Button>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmRemove}
        onClose={() => {
          if (busy !== "remove") {
            setConfirmRemove(false);
            setRemoveError(null);
          }
        }}
        onConfirm={remove}
        title={t.remove}
        description={`${t.removeConfirm} ${t.removeUndo}`}
        confirmLabel={t.remove}
        cancelLabel={t.cancel}
        tone="danger"
        busy={busy === "remove"}
        error={removeError}
        typeToConfirm={{
          expected: initial.domain,
          label: t.typeDomain.replace("{domain}", initial.domain),
        }}
      />
    </SectionCard>
  );
}
