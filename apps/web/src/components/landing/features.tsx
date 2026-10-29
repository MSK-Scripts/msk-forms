import { ArrowRight } from "@/components/icons";
import { FactList } from "@/components/page/fact-list";
import { Section, TextLink } from "@/components/page/section";
import { getDict } from "@/i18n";

/**
 * Why MSK Forms: the status loop first, as a statement with the three steps
 * an applicant sees, then the bot and the builder as facts beside it. Until
 * the redesign these were one large and two small icon cards.
 */
export async function Features() {
  const t = await getDict();
  const f = t.features;

  return (
    <Section
      id="why-title"
      kicker={f.eyebrow}
      title={f.title}
      intro={f.sub}
      action={<TextLink href="/f/demo-whitelist">{t.hero.demo}</TextLink>}
    >
      <div className="grid gap-[var(--space-stack)]">
        <div className="grid max-w-[48rem] gap-4">
          <h3 className="font-display text-h3 font-[650] text-balance">{f.uspTitle}</h3>
          <p className="max-w-[60ch] text-lead text-muted-foreground">{f.uspBody}</p>
          {/* The three states an applicant sees, in order. */}
          <ol className="flex flex-wrap items-center gap-x-2 gap-y-2">
            {[f.sSubmitted, f.sInReview, f.sAccepted].map((state, i) => (
              <li key={state} className="flex items-center gap-2">
                {i > 0 && <ArrowRight className="h-4 w-4 text-muted-foreground" />}
                <span
                  className={
                    i === 2
                      ? "rounded-sm bg-accent-soft px-2.5 py-1 text-small font-semibold text-primary"
                      : "rounded-sm bg-muted px-2.5 py-1 text-small font-semibold text-foreground"
                  }
                >
                  {state}
                </span>
              </li>
            ))}
          </ol>
        </div>
        <FactList
          items={[
            { title: f.botTitle, text: f.botBody },
            { title: f.buildTitle, text: f.buildBody },
          ]}
        />
      </div>
    </Section>
  );
}
