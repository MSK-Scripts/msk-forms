import { Check } from "@/components/icons";
import { Section, TextLink } from "@/components/page/section";
import { getDict } from "@/i18n";

/**
 * The whole feature set as a checked list in columns that follow the width
 * of the section, without a card around it. Every entry is something the
 * code does; the comparison on the pricing page says which plan has it.
 */
export async function FeatureGrid() {
  const dict = await getDict();
  const t = dict.featureGrid;

  return (
    <Section
      id="features-title"
      kicker={t.eyebrow}
      title={t.title}
      intro={t.sub}
      action={<TextLink href="/pricing">{dict.pricing.compare.title}</TextLink>}
    >
      <ul className="grid gap-x-[clamp(2rem,4cqi,5rem)] @3xl:grid-cols-2 @6xl:grid-cols-3">
        {t.items.map((item) => (
          <li key={item} className="flex items-start gap-2.5 border-t border-border py-3">
            <Check className="mt-[0.3em] h-4 w-4 shrink-0 text-primary" weight="bold" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </Section>
  );
}
