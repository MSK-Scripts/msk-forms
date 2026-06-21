"use client";

import type { BotConfig } from "@msk-forms/shared";
import { Button, Card, Field, Input } from "@msk-forms/ui";
import { useRouter } from "next/navigation";
import { useState } from "react";

import type { Dictionary } from "@/i18n";

type BotDict = Dictionary["botConfig"];

export function BotConfigForm({
  guildId,
  initial,
  t,
}: {
  guildId: string;
  initial: BotConfig;
  t: BotDict;
}) {
  const router = useRouter();
  const [channel, setChannel] = useState(initial.reviewChannelId ?? "");
  const [role, setRole] = useState(initial.acceptedRoleId ?? "");
  const [postName, setPostName] = useState(initial.postName ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function save() {
    setError(null);
    setSaved(false);
    setSaving(true);
    try {
      const body: Record<string, string> = {};
      if (channel.trim()) body.reviewChannelId = channel.trim();
      if (role.trim()) body.acceptedRoleId = role.trim();
      if (postName.trim()) body.postName = postName.trim();
      const res = await fetch(`/api/guilds/${guildId}/bot-config`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? t.errSave);
      }
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errSave);
    } finally {
      setSaving(false);
    }
  }

  const onEdit = (set: (v: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    set(e.target.value);
    setSaved(false);
  };

  return (
    <Card className="flex flex-col gap-4 p-5">
      <Field label={t.reviewChannel} hint={t.reviewChannelHint}>
        <Input value={channel} placeholder="123456789012345678" onChange={onEdit(setChannel)} />
      </Field>
      <Field label={t.acceptedRole} hint={t.acceptedRoleHint}>
        <Input value={role} placeholder="123456789012345678" onChange={onEdit(setRole)} />
      </Field>
      <p className="text-xs text-muted-foreground">{t.idHint}</p>

      <Field label={t.postName} hint={t.postNameHint}>
        <Input value={postName} placeholder="MSK Forms" onChange={onEdit(setPostName)} />
      </Field>

      <div className="flex items-center gap-3">
        <Button type="button" onClick={save} disabled={saving}>
          {saving ? t.saving : t.save}
        </Button>
        {saved && <span className="text-sm text-primary">{t.saved}</span>}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </Card>
  );
}
