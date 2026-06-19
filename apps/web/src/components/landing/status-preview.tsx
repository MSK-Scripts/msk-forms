import { IconCheck, IconClock, IconRefresh, IconSend } from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDict } from "@/i18n";

/**
 * Hero visual: a faithful miniature of the real applicant status card (the
 * product's feedback-loop USP), built from the actual shadcn Card + Badge.
 */
export async function StatusPreview() {
  const t = (await getDict()).preview;

  return (
    <Card className="mx-auto w-full max-w-md text-left shadow-lg">
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div>
          <CardDescription className="text-[11px] uppercase tracking-wider">
            {t.submission}
          </CardDescription>
          <CardTitle className="mt-1.5">{t.title}</CardTitle>
        </div>
        <Badge>
          <IconRefresh size={12} stroke={2} />
          {t.inReview}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-3.5">
          <Row icon={<IconSend size={13} stroke={1.75} />} label={t.submitted} time="Jun 18" done />
          <Row icon={<IconClock size={13} stroke={1.75} />} label={t.pickedUp} time="Jun 19" done />
          <Row icon={<IconCheck size={13} stroke={1.75} />} label={t.decision} time={t.pending} />
        </div>
        <div className="rounded-md border bg-muted/50 p-3">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{t.reviewerNote}</p>
          <p className="mt-1 text-sm text-foreground">{t.note}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function Row({
  icon,
  label,
  time,
  done,
}: {
  icon: React.ReactNode;
  label: string;
  time: string;
  done?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${
          done ? "border-primary/30 bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
        }`}
      >
        {icon}
      </span>
      <span className="flex-1 text-sm text-foreground">{label}</span>
      <span className="text-[11px] tabular-nums text-muted-foreground">{time}</span>
    </div>
  );
}
