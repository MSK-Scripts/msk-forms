"use client";

import { CopyField, type CopyFieldCopy } from "@/components/dashboard-kit";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";

export interface ShareLabels {
  share: string;
  link: string;
  qrCode: string;
}

/**
 * Where a live form can be shared: the public link as a CopyField that stays
 * selectable text, and a QR code rendered on the server, so no script draws
 * it. A dialog, opened from the form's row.
 *
 * No iframe embed snippet: the CSP forbids framing every page
 * (`frame-ancestors 'none'` and `X-Frame-Options: DENY` in proxy.ts), so an
 * embedded form never loaded.
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
        </div>
      }
    >
      <Button variant="outline" onClick={onClose}>
        {closeLabel}
      </Button>
    </Dialog>
  );
}
