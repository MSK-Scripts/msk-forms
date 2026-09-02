import { Wordmark } from "@/components/landing/wordmark";
import { shopLegalUrl } from "@/lib/legal";
import { getDict, getLocale } from "@/i18n";

interface FooterLink {
  label: string;
  href: string;
}

function isExternal(href: string) {
  return /^https?:\/\//i.test(href);
}

function Column({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <div>
      <div className="mb-3.5 font-mono text-[0.6875rem] font-bold uppercase tracking-widest text-muted-foreground">
        {title}
      </div>
      {links.map((l) => (
        <a
          key={l.href}
          href={l.href}
          {...(isExternal(l.href) ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className="block py-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          {l.label}
        </a>
      ))}
    </div>
  );
}

export async function SiteFooter() {
  const t = await getDict();
  const locale = await getLocale();

  const product: FooterLink[] = [
    { label: t.pricing.nav, href: "/pricing" },
    { label: t.stats.nav, href: "/stats" },
    { label: t.footer.demoForm, href: "/f/demo-whitelist" },
    { label: t.footer.documentation, href: "https://docu.msk-scripts.de/ecosystem/msk-forms" },
    { label: t.footer.github, href: "https://github.com/MSK-Scripts" },
  ];
  const ecosystem: FooterLink[] = [
    { label: "MSK Shop", href: "https://www.msk-scripts.de/" },
    { label: "MSK Paste", href: "https://paste.msk-scripts.de/" },
    { label: "MSK Shortener", href: "https://s.msk-scripts.de/" },
  ];
  const legal: FooterLink[] = [
    { label: t.footer.imprint, href: "/terms/imprint" },
    { label: t.footer.privacy, href: "/terms/privacy" },
    { label: t.footer.terms, href: "/terms" },
    { label: t.legal.withdrawalInfo, href: shopLegalUrl(locale, "/terms/widerruf") },
    { label: t.legal.dpa, href: shopLegalUrl(locale, "/terms/avv") },
  ];
  // The three buttons the law asks for, in their own column rather than among
  // the document links above. § 356a and § 312k BGB want them clearly visible,
  // and a seventh entry in a list of legal texts is the opposite of that. The
  // German labels are prescribed and must not be shortened to "Kuendigung" or
  // "Widerruf".
  const duties: FooterLink[] = [
    { label: t.legal.revoke, href: shopLegalUrl(locale, "/vertrag-widerrufen") },
    { label: t.legal.cancel, href: shopLegalUrl(locale, "/vertrag-kuendigen") },
    { label: t.legal.report, href: shopLegalUrl(locale, "/report") },
  ];

  return (
    <footer className="mt-16 border-t border-border bg-muted/30">
      <div className="container pwa-safe-b pt-12">
        <div className="flex flex-col gap-10 lg:flex-row lg:justify-between">
          <div className="max-w-sm">
            <Wordmark />
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">{t.footer.tagline}</p>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-4 lg:flex lg:gap-16">
            <Column title={t.footer.product} links={product} />
            <Column title={t.footer.ecosystem} links={ecosystem} />
            <Column title={t.footer.legal} links={legal} />
            <Column title={t.legal.footerDuties} links={duties} />
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6">
          <p className="text-xs text-muted-foreground">
            © 2026 MSK Scripts. {t.footer.rights}
          </p>
        </div>
      </div>
    </footer>
  );
}
