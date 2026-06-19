import { StatusBadge } from "@msk-forms/ui";
import { IconBrandDiscord, IconForms, IconRefresh } from "@tabler/icons-react";

export function Features() {
  return (
    <section className="mx-auto max-w-content px-6 py-20 lg:py-28">
      <div className="reveal max-w-2xl">
        <h2 className="font-heading text-3xl font-bold tracking-tight text-text-primary md:text-4xl">
          The part most form tools skip.
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-text-secondary">
          A form is easy. Telling people what happened after they hit submit is
          the hard part. That is the whole point of MSK Forms.
        </p>
      </div>

      <div className="reveal mt-12 grid gap-4 lg:grid-cols-3 lg:grid-rows-2">
        {/* USP cell: large, with a real status mini-visual */}
        <article className="flex flex-col justify-between gap-8 rounded-lg border border-border-accent bg-bg-panel p-7 lg:col-span-2 lg:row-span-2">
          <div>
            <FeatureIcon>
              <IconRefresh size={22} stroke={1.75} />
            </FeatureIcon>
            <h3 className="mt-5 font-heading text-2xl font-bold text-text-primary">
              Applicants always know where they stand.
            </h3>
            <p className="mt-3 max-w-md leading-relaxed text-text-secondary">
              Every submission gets a private link. The status updates the moment
              a reviewer acts, on the same page they applied. No more &ldquo;did
              you see my application?&rdquo;
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <StatusBadge label="Submitted" color="#6b6b72" />
            <span className="text-text-muted">&rarr;</span>
            <StatusBadge label="In review" color="#00E676" />
            <span className="text-text-muted">&rarr;</span>
            <StatusBadge label="Accepted" color="#00E676" />
          </div>
        </article>

        <FeatureCard
          icon={<IconBrandDiscord size={22} stroke={1.75} />}
          title="A bot to invite"
          body="Post forms to a channel and push status updates straight to applicants as DMs."
        />
        <FeatureCard
          icon={<IconForms size={22} stroke={1.75} />}
          title="Build without code"
          body="Compose forms from typed fields: text, choices, dates, consent. Ready in seconds."
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
    <article className="rounded-lg border border-border bg-bg-panel p-7">
      <FeatureIcon>{icon}</FeatureIcon>
      <h3 className="mt-5 font-heading text-xl font-bold text-text-primary">{title}</h3>
      <p className="mt-2.5 leading-relaxed text-text-secondary">{body}</p>
    </article>
  );
}

function FeatureIcon({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent/10 text-accent">
      {children}
    </span>
  );
}
