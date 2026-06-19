import { IconBrandDiscord, IconForms, IconRefresh } from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getDict } from "@/i18n";

export async function Features() {
  const t = await getDict();

  return (
    <section className="container py-20 lg:py-28">
      <div className="max-w-2xl">
        <h2 className="text-balance font-heading text-3xl font-bold tracking-tight md:text-4xl">
          {t.features.title}
        </h2>
        <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
          {t.features.sub}
        </p>
      </div>

      <div className="mt-12 grid gap-5 lg:grid-cols-3 lg:grid-rows-2">
        <Card className="flex flex-col justify-between lg:col-span-2 lg:row-span-2">
          <CardContent className="flex h-full flex-col justify-between gap-10 p-8">
            <div>
              <FeatureIcon>
                <IconRefresh size={22} stroke={1.75} />
              </FeatureIcon>
              <h3 className="mt-6 text-balance font-heading text-2xl font-bold">
                {t.features.uspTitle}
              </h3>
              <p className="mt-3 max-w-md text-pretty leading-relaxed text-muted-foreground">
                {t.features.uspBody}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="muted">{t.features.sSubmitted}</Badge>
              <span className="text-muted-foreground">&rarr;</span>
              <Badge>{t.features.sInReview}</Badge>
              <span className="text-muted-foreground">&rarr;</span>
              <Badge>{t.features.sAccepted}</Badge>
            </div>
          </CardContent>
        </Card>

        <FeatureCard
          icon={<IconBrandDiscord size={22} stroke={1.75} />}
          title={t.features.botTitle}
          body={t.features.botBody}
        />
        <FeatureCard
          icon={<IconForms size={22} stroke={1.75} />}
          title={t.features.buildTitle}
          body={t.features.buildBody}
        />
      </div>
    </section>
  );
}

function FeatureCard({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <Card>
      <CardContent className="p-7">
        <FeatureIcon>{icon}</FeatureIcon>
        <h3 className="mt-6 font-heading text-xl font-bold">{title}</h3>
        <p className="mt-2.5 text-pretty leading-relaxed text-muted-foreground">{body}</p>
      </CardContent>
    </Card>
  );
}

function FeatureIcon({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex h-11 w-11 items-center justify-center rounded-md bg-primary/10 text-primary">
      {children}
    </span>
  );
}
