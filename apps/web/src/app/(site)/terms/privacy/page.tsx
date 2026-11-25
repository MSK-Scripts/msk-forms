import type { Metadata } from "next";

import { LegalContent } from "@/components/legal/legal-content";
import { privacy } from "@/content/legal/privacy";
import { renderMarkdown } from "@/lib/legal";
import { getDict, getLocale } from "@/i18n";

export const metadata: Metadata = {
  title: "Privacy Policy (GDPR) · MSK Forms",
  description:
    "How MSK Forms handles personal data under the GDPR: what is stored for guilds and applicants, for how long, and which rights you have.",
  alternates: { canonical: "/terms/privacy" },
};

export default async function PrivacyPage() {
  const locale = await getLocale();
  const dict = await getDict();
  const html = renderMarkdown(locale === "de" ? privacy.de : privacy.en);

  return (
    <LegalContent
      html={html}
      breadcrumb={dict.footer.privacy}
      href="/terms/privacy"
      homeLabel={dict.site.home}
      breadcrumbLabel={dict.kit.breadcrumb}
    />
  );
}
