import type { Metadata } from "next";

import { LegalContent } from "@/components/legal/legal-content";
import { privacy } from "@/content/legal/privacy";
import { renderMarkdown } from "@/lib/legal";
import { getDict, getLocale } from "@/i18n";

export const metadata: Metadata = { title: "Privacy Policy — MSK Forms" };

export default async function PrivacyPage() {
  const locale = await getLocale();
  const dict = await getDict();
  const html = renderMarkdown(locale === "de" ? privacy.de : privacy.en);

  return (
    <LegalContent
      html={html}
      breadcrumb={dict.footer.privacy}
      href="/terms/privacy"
      homeLabel={locale === "de" ? "Startseite" : "Home"}
    />
  );
}
