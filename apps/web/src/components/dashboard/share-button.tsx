"use client";

import { CopyField, type CopyFieldCopy } from "@/components/dashboard-kit";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";

export interface ShareLabels {
  share: string;
  link: string;
  qrCode: string;
  embedCode: string;
}

/**
 * Where a live form can be shared: the public link, a QR code (rendered on
 * the server, so no script draws it) and an embed snippet, each value as a
 * CopyField that stays selectable text. A dialog, opened from the form's row.
 */
export function ShareDialog({
  open,
  onClose,
  title,
  url,
  qrDataUrl,
  qrAlt,
  closeLabel,
  t,
  copy,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  url: string;
  qrDataUrl: string | null;
  /** Describes the QR code for a screen reader: "QR code for https://…". */
  qrAlt: string;
  closeLabel: string;
  t: ShareLabels;
  copy: CopyFieldCopy;
}) {
  const embed = `<iframe src="${url}" width="100%" height="600" style="border:0" title="MSK Forms"></iframe>`;
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      className="w-[min(100%_-_2rem,36rem)]"
      body={
        <div className="grid gap-5">
          <CopyField label={t.link} value={url} copy={copy} />
          {qrDataUrl && (
            <figure className="grid justify-items-start gap-1.5">
              <figcaption className="text-small font-semibold">{t.qrCode}</figcaption>
              {/* A white tile in both themes: phone cameras read dark modules on light ground. */}
              <img src={qrDataUrl} alt={qrAlt} width={176} height={176} className="rounded-md bg-white p-1" />
            </figure>
          )}
          <CopyField label={t.embedCode} value={embed} copy={copy} />
        </div>
      }
    >
      <Button variant="outline" onClick={onClose}>
        {closeLabel}
      </Button>
    </Dialog>
  );
}
