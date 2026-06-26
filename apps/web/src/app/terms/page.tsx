import type { Metadata } from "next";

import { LegalContent } from "@/components/legal/legal-content";
import { terms } from "@/content/legal/terms";
import { renderMarkdown } from "@/lib/legal";
import { getDict, getLocale } from "@/i18n";

export const metadata: Metadata = { title: "Terms & Conditions — MSK Forms" };

export default async function TermsPage() {
  const locale = await getLocale();
  const dict = await getDict();
  const html = renderMarkdown(locale === "de" ? terms.de : terms.en);

  return (
    <LegalContent
      html={html}
      breadcrumb={dict.footer.terms}
      href="/terms"
      homeLabel={locale === "de" ? "Startseite" : "Home"}
    />
  );
}
