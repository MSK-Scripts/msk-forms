import type { Metadata } from "next";

import { LegalContent } from "@/components/legal/legal-content";
import { imprint } from "@/content/legal/imprint";
import { renderMarkdown } from "@/lib/legal";
import { getDict, getLocale } from "@/i18n";

export const metadata: Metadata = {
  title: "Imprint and contact · MSK Forms",
  description:
    "Legal notice of MSK Forms by MSK Scripts: provider, postal address and contact details.",
  alternates: { canonical: "/terms/imprint" },
};

export default async function ImprintPage() {
  const locale = await getLocale();
  const dict = await getDict();
  const html = renderMarkdown(locale === "de" ? imprint.de : imprint.en);

  return (
    <LegalContent
      html={html}
      breadcrumb={dict.footer.imprint}
      href="/terms/imprint"
      homeLabel={dict.site.home}
      breadcrumbLabel={dict.kit.breadcrumb}
    />
  );
}
