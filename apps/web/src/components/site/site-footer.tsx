import { ThemeSwitch } from "@/components/dashboard-kit/theme-switch";
import { ArrowSquareOut } from "@/components/icons";
import { GithubMark } from "@/components/icons/brand-marks";
import { shopLegalUrl } from "@/lib/legal";
import { shopUrl } from "@/lib/shop-url";
import { getDict, getLocale } from "@/i18n";

interface FooterLink {
  label: string;
  href: string;
}

const FORMS_ORIGIN = "https://forms.msk-scripts.de";

/**
 * Another site; the hub of MSK Scripts on this one is not. Compares the
 * parsed origin, so a host that merely starts with ours counts as external.
 */
function isExternal(href: string) {
  if (!/^https?:\/\//i.test(href)) return false;
  return new URL(href).origin !== FORMS_ORIGIN;
}

const linkClass =
  "inline-flex min-h-11 items-center gap-1.5 text-band-muted transition-colors duration-150 " +
  "hover:text-band-foreground hover:underline underline-offset-4";

/**
 * The footer of the site pages, after the shop's: four link columns on the
 * anthracite band beside the brand and the appearance switch, one bottom
 * line. Links that leave forms.msk-scripts.de open in a new tab and say so.
 */
export async function SiteFooter() {
  const [dict, locale] = await Promise.all([getDict(), getLocale()]);
  const t = dict.footer;
  const newTab = dict.site.newTab;

  const columns: { title: string; links: FooterLink[] }[] = [
    {
      title: t.product,
      links: [
        { label: dict.pricing.nav, href: "/pricing" },
        { label: dict.stats.nav, href: "/stats" },
        { label: t.demoForm, href: "/f/demo-whitelist" },
        { label: "MSK Scripts Hub", href: `${FORMS_ORIGIN}/msk-forms` },
        { label: t.documentation, href: "https://docu.msk-scripts.de/ecosystem/msk-forms" },
        { label: t.github, href: "https://github.com/MSK-Scripts" },
      ],
    },
    {
      title: t.ecosystem,
      links: [
        { label: "MSK Shop", href: shopUrl(locale, "/") },
        { label: "MSK Paste", href: "https://paste.msk-scripts.de/" },
        { label: "MSK Shortener", href: "https://s.msk-scripts.de/" },
      ],
    },
    {
      title: t.legal,
      links: [
        { label: t.imprint, href: "/terms/imprint" },
        { label: t.privacy, href: "/terms/privacy" },
        { label: t.terms, href: "/terms" },
        { label: dict.legal.withdrawalInfo, href: shopLegalUrl(locale, "/legal/withdrawal") },
        { label: dict.legal.dpa, href: shopLegalUrl(locale, "/legal/dpa") },
      ],
    },
    {
      // A column of its own rather than among the document links: § 356a and
      // § 312k BGB want the buttons clearly visible. The German labels are
      // prescribed and must not be shortened to "Kündigung" or "Widerruf".
      title: dict.legal.footerDuties,
      links: [
        { label: dict.legal.revoke, href: shopLegalUrl(locale, "/withdraw-contract") },
        { label: dict.legal.cancel, href: shopLegalUrl(locale, "/cancel-contract") },
        { label: dict.legal.report, href: shopLegalUrl(locale, "/report") },
      ],
    },
  ];

  return (
    <footer className="surface-band pb-[env(safe-area-inset-bottom)]">
      <div className="container-page grid gap-12 py-[clamp(3rem,2rem+3vw,6rem)]">
        <div className="@container">
          <div className="grid gap-x-10 gap-y-10 @lg:grid-cols-2 @4xl:grid-cols-4 @7xl:grid-cols-[minmax(0,1.4fr)_repeat(4,minmax(0,1fr))]">
            <div className="grid content-start gap-4 @lg:col-span-2 @4xl:col-span-4 @7xl:col-span-1">
              <a
                href="/"
                className="inline-flex min-h-11 items-center gap-2.5 self-start text-band-foreground"
              >
                <img
                  src="/logo.png"
                  alt=""
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-lg object-contain"
                />
                <span className="font-display text-lead font-bold [font-stretch:108%]">
                  MSK Forms
                </span>
              </a>
              <p className="max-w-[40ch] text-small text-band-muted">{t.tagline}</p>
              <div className="grid gap-2">
                <p className="text-small font-semibold">{dict.kit.shell.theme.group}</p>
                <ThemeSwitch labels={dict.kit.shell.theme} tone="band" />
              </div>
            </div>

            {columns.map((col) => (
              <div key={col.title} className="grid content-start gap-2">
                <h2 className="text-label font-semibold tracking-[0.08em] text-band-foreground uppercase">
                  {col.title}
                </h2>
                <ul>
                  {col.links.map((link) => (
                    <li key={link.href}>
                      {isExternal(link.href) ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={linkClass}
                        >
                          {link.label}
                          <ArrowSquareOut className="h-3.5 w-3.5" />
                          <span className="sr-only"> {newTab}</span>
                        </a>
                      ) : (
                        <a href={link.href} className={linkClass}>
                          {link.label}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-band-line pt-6 text-small text-band-muted">
          <span>
            © {new Date().getFullYear()} MSK Scripts. {t.rights}
          </span>
          <span aria-hidden="true">·</span>
          <span>
            {dict.site.builtBy}{" "}
            <a
              href="https://www.musiker15.de"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center underline-offset-4 hover:text-band-foreground hover:underline"
            >
              Musiker15
              <span className="sr-only"> {newTab}</span>
            </a>
          </span>
          <span aria-hidden="true">·</span>
          <a
            href="https://github.com/MSK-Scripts"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-1.5 underline-offset-4 hover:text-band-foreground hover:underline"
          >
            <GithubMark className="h-4 w-4" />
            GitHub
            <span className="sr-only"> {newTab}</span>
          </a>
        </p>
      </div>
    </footer>
  );
}
