import { Card } from "@msk-forms/ui";

/** A small "this is a Pro feature" panel shown in place of gated controls. */
export function ProNotice({ title, body }: { title: string; body: string }) {
  return (
    <Card className="flex flex-col gap-2 border-primary/30 bg-primary/5 p-6">
      <span className="inline-flex w-fit items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-primary">
        ★ Pro
      </span>
      <h3 className="font-heading text-base font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground">{body}</p>
    </Card>
  );
}
