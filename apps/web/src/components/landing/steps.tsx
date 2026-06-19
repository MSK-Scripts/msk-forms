import { IconForms, IconLink, IconChecks } from "@tabler/icons-react";

const STEPS = [
  {
    icon: <IconForms size={20} stroke={1.75} />,
    title: "Build",
    body: "Drop in the fields you need and set who can submit.",
  },
  {
    icon: <IconLink size={20} stroke={1.75} />,
    title: "Share",
    body: "Publish a link or post the form to Discord with the bot.",
  },
  {
    icon: <IconChecks size={20} stroke={1.75} />,
    title: "Review",
    body: "Accept, reject, or ask for more. Applicants see it live.",
  },
];

export function Steps() {
  return (
    <section className="border-y border-border bg-bg-panel/40">
      <div className="mx-auto max-w-content px-6 py-20 lg:py-24">
        <h2 className="reveal font-heading text-3xl font-bold tracking-tight text-text-primary md:text-4xl">
          From zero to live in three steps.
        </h2>

        <ol className="reveal mt-12 grid gap-10 md:grid-cols-3 md:gap-6">
          {STEPS.map((step, i) => (
            <li key={step.title} className="relative">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-bg text-accent">
                  {step.icon}
                </span>
                <span className="font-mono text-xs uppercase tracking-widest text-text-muted">
                  0{i + 1}
                </span>
              </div>
              <h3 className="mt-5 font-heading text-xl font-bold text-text-primary">
                {step.title}
              </h3>
              <p className="mt-2 max-w-xs leading-relaxed text-text-secondary">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
