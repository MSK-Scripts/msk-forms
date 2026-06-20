"use client";

import { Button } from "@msk-forms/ui";
import { useState } from "react";

export interface ShareLabels {
  share: string;
  link: string;
  copy: string;
  copied: string;
  qrCode: string;
  embedCode: string;
}

/**
 * Per-form distribution panel (concept §4/§9): public link, a (server-rendered)
 * QR code, and an embed snippet — each with a copy button. Toggled open inline.
 */
export function ShareButton({
  url,
  qrDataUrl,
  t,
}: {
  url: string;
  qrDataUrl: string;
  t: ShareLabels;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const embed = `<iframe src="${url}" width="100%" height="600" style="border:0" title="MSK Forms"></iframe>`;

  async function copy(text: string, key: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied((c) => (c === key ? null : c)), 1500);
    } catch {
      /* clipboard unavailable — ignore */
    }
  }

  const CopyBtn = ({ text, k }: { text: string; k: string }) => (
    <Button variant="ghost" className="shrink-0" onClick={() => copy(text, k)}>
      {copied === k ? t.copied : t.copy}
    </Button>
  );

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="self-start text-sm font-medium text-primary transition-colors hover:underline"
      >
        {t.share}
      </button>

      {open && (
        <div className="flex flex-col gap-4 rounded-md border border-border bg-background p-4">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t.link}
            </span>
            <div className="flex gap-2">
              <input
                readOnly
                value={url}
                onFocus={(e) => e.currentTarget.select()}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
              />
              <CopyBtn text={url} k="link" />
            </div>
          </label>

          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t.qrCode}
            </span>
            <img src={qrDataUrl} alt={t.qrCode} width={176} height={176} className="rounded-md" />
          </div>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t.embedCode}
            </span>
            <div className="flex gap-2">
              <textarea
                readOnly
                value={embed}
                rows={2}
                onFocus={(e) => e.currentTarget.select()}
                className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 font-mono text-xs text-foreground"
              />
              <CopyBtn text={embed} k="embed" />
            </div>
          </label>
        </div>
      )}
    </div>
  );
}
