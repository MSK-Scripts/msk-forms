import { IconChecks, IconForms, IconLink } from "@tabler/icons-react";

import { getDict } from "@/i18n";

export async function Steps() {
  const t = await getDict();

  const steps = [
    { icon: <IconForms size={20} stroke={1.75} />, title: t.steps.build, body: t.steps.buildBody },
    { icon: <IconLink size={20} stroke={1.75} />, title: t.steps.share, body: t.steps.shareBody },
    { icon: <IconChecks size={20} stroke={1.75} />, title: t.steps.review, body: t.steps.reviewBody },
  ];

  return (
    <section className="border-y border-border bg-muted/30">
      <div className="container py-20 lg:py-24">
        <h2 className="text-balance font-heading text-3xl font-bold tracking-tight md:text-4xl">
          {t.steps.title}
        </h2>

        <ol className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
          {steps.map((step, i) => (
            <li key={step.title}>
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-md border bg-background text-primary">
                  {step.icon}
                </span>
                <span className="text-sm font-medium tabular-nums text-muted-foreground">
                  0{i + 1}
                </span>
              </div>
              <h3 className="mt-5 font-heading text-xl font-bold">{step.title}</h3>
              <p className="mt-2 max-w-xs text-pretty leading-relaxed text-muted-foreground">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
