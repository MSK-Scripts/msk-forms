import { FactList } from "@/components/page/fact-list";
import { Section } from "@/components/page/section";
import { getDict } from "@/i18n";

/** How it works: build, share, review, as a numbered list rather than icon tiles. */
export async function Steps() {
  const t = (await getDict()).steps;

  return (
    <Section id="steps-title" kicker={t.eyebrow} title={t.title}>
      <FactList
        numbered
        wide
        items={[
          { title: t.build, text: t.buildBody },
          { title: t.share, text: t.shareBody },
          { title: t.review, text: t.reviewBody },
        ]}
      />
    </Section>
  );
}
