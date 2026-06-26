import { IconCheck } from "@tabler/icons-react";

import { Card, CardContent } from "@/components/ui/card";
import { getDict } from "@/i18n";

/** A compact grid enumerating the full MSK Forms feature set. */
export async function FeatureGrid() {
  const t = (await getDict()).featureGrid;

  return (
    <section className="container py-20 lg:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <span className="eyebrow justify-center">{t.eyebrow}</span>
        <h2 className="mt-4 text-balance font-heading text-3xl font-bold tracking-tight md:text-4xl">
          {t.title}
        </h2>
        <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">{t.sub}</p>
      </div>

      <Card className="mx-auto mt-10 max-w-4xl">
        <CardContent className="grid gap-x-8 gap-y-3.5 p-7 sm:grid-cols-2">
          {t.items.map((item) => (
            <div key={item} className="flex items-start gap-2.5 text-sm">
              <IconCheck size={18} stroke={2} className="mt-0.5 shrink-0 text-primary" />
              <span className="text-foreground">{item}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}
