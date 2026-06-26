import type { Metadata } from "next";

import { LegalContent } from "@/components/legal/legal-content";
import { imprint } from "@/content/legal/imprint";
import { renderMarkdown } from "@/lib/legal";
import { getDict, getLocale } from "@/i18n";

export const metadata: Metadata = { title: "Imprint — MSK Forms" };

export default async function ImprintPage() {
  const locale = await getLocale();
  const dict = await getDict();
  const html = renderMarkdown(locale === "de" ? imprint.de : imprint.en);

  return (
    <LegalContent
      html={html}
      breadcrumb={dict.footer.imprint}
      href="/terms/imprint"
      homeLabel={locale === "de" ? "Startseite" : "Home"}
    />
  );
}
