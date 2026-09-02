// ── Order confirmation, § 312f BGB ──────────────────────────────────────────
//
// For a distance contract about a service the trader has to confirm the
// contract "within a reasonable time after conclusion, on a durable medium",
// including the information required by Art. 246a EGBGB. Stripe sends a
// payment receipt, which is not the same thing: it names neither the term nor
// how to cancel, and it says nothing at all about the right of withdrawal.
//
// Hence this mail. Pure and testable without SMTP; the transport lives in
// lib/mail.ts.
//
// The legal pages it links to are the ones on msk-scripts.de. MSK Scripts is
// one trader, the withdrawal instructions and the data processing agreement
// there already name MSK Forms Pro and Enterprise by name, and a second copy
// on this domain would only drift.

export type MailLang = "de" | "en";

const SHOP_URL = "https://www.msk-scripts.de";

// The mail goes out as noreply@msk-scripts.de, so it names the contact address
// instead of inviting a reply into a mailbox nobody reads. Art. 246a EGBGB
// wants the trader reachable anyway, and this is the document the customer
// keeps.
const CONTACT = "info@msk-scripts.de";

/** Escape the few characters that could break out of the HTML body. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Pick the mail language from Stripe's preferred_locales. German only when the
 * customer explicitly says so; everything else gets English, which is also the
 * platform default.
 */
export function pickMailLang(locales: string[] | null | undefined): MailLang {
  return locales?.some((l) => l.toLowerCase().startsWith("de")) ? "de" : "en";
}

export interface OrderConfirmationInput {
  lang: MailLang;
  /** Display name of the plan, "Pro" or "Enterprise". */
  planLabel: string;
  /** Discord server name, or the id when the name is unknown. Foreign input. */
  guildLabel: string;
  /** Monthly price, already formatted ("4,99 €" or "4.99 €"). */
  price: string;
  /** Absolute link into the guild's dashboard. */
  dashboardUrl: string;
}

export interface BuiltEmail {
  subject: string;
  text: string;
  html: string;
}

export function buildOrderConfirmation(input: OrderConfirmationInput): BuiltEmail {
  const { lang, planLabel, guildLabel, price, dashboardUrl } = input;
  const de = lang === "de";
  const prefix = de ? "/de" : "";

  const links = {
    terms: `${SHOP_URL}${prefix}/terms`,
    withdrawal: `${SHOP_URL}${prefix}/terms/widerruf`,
    dpa: `${SHOP_URL}${prefix}/terms/avv`,
    revoke: `${SHOP_URL}${prefix}/vertrag-widerrufen`,
    cancel: `${SHOP_URL}${prefix}/vertrag-kuendigen`,
  };

  const subject = de
    ? `Bestellbestätigung: MSK Forms ${planLabel} für ${guildLabel}`
    : `Order confirmation: MSK Forms ${planLabel} for ${guildLabel}`;

  const rows = [
    de ? `Leistung: MSK Forms ${planLabel}` : `Service: MSK Forms ${planLabel}`,
    de ? `Discord-Server: ${guildLabel}` : `Discord server: ${guildLabel}`,
    de
      ? `Preis: ${price} pro Monat, keine Umsatzsteuer ausgewiesen (§ 19 UStG)`
      : `Price: ${price} per month, no VAT shown (§ 19 UStG)`,
    de
      ? "Laufzeit: ein Monat, verlängert sich monatlich, keine Mindestlaufzeit"
      : "Term: one month, renews monthly, no minimum term",
  ];

  const body = de
    ? [
        "vielen Dank für deine Bestellung. Hiermit bestätigen wir den Vertrag auf einem dauerhaften Datenträger.",
        "",
        ...rows,
        "",
        `Kündigung jederzeit zum Ende des Abrechnungszeitraums: ${links.cancel}`,
        `Widerruf innerhalb von 14 Tagen: ${links.revoke}`,
        `Widerrufsbelehrung mit Muster-Formular: ${links.withdrawal}`,
        `Auftragsverarbeitung (Art. 28 DSGVO): ${links.dpa}`,
        `Unsere AGB: ${links.terms}`,
        `Dein Dashboard: ${dashboardUrl}`,
        "",
        `Bei Fragen erreichst du uns unter ${CONTACT}.`,
      ]
    : [
        "thank you for your order. We hereby confirm the contract on a durable medium.",
        "",
        ...rows,
        "",
        `Cancel at any time to the end of the billing period: ${links.cancel}`,
        `Withdraw within 14 days: ${links.revoke}`,
        `Withdrawal instructions with model form: ${links.withdrawal}`,
        `Data processing agreement (Art. 28 GDPR): ${links.dpa}`,
        `Our Terms and Conditions: ${links.terms}`,
        `Your dashboard: ${dashboardUrl}`,
        "",
        `If you have any questions, write to us at ${CONTACT}.`,
      ];

  const text = [subject, "", ...body].join("\n");

  const html = [
    `<p><strong>${escapeHtml(subject)}</strong></p>`,
    `<p>${escapeHtml(body[0]!)}</p>`,
    `<ul>${rows.map((r) => `<li>${escapeHtml(r)}</li>`).join("")}</ul>`,
    "<ul>",
    `<li><a href="${links.cancel}">${de ? "Verträge hier kündigen" : "Cancel contracts here"}</a></li>`,
    `<li><a href="${links.revoke}">${de ? "Vertrag widerrufen" : "Withdraw from contract"}</a></li>`,
    `<li><a href="${links.withdrawal}">${de ? "Widerrufsbelehrung" : "Withdrawal instructions"}</a></li>`,
    `<li><a href="${links.dpa}">${de ? "Auftragsverarbeitung" : "Data processing agreement"}</a></li>`,
    `<li><a href="${links.terms}">${de ? "AGB" : "Terms and Conditions"}</a></li>`,
    `<li><a href="${escapeHtml(dashboardUrl)}">Dashboard</a></li>`,
    "</ul>",
    `<p>${escapeHtml(body[body.length - 1]!)}</p>`,
  ].join("\n");

  return { subject, text, html };
}
