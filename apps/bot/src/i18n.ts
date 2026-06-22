/**
 * Minimal bot-side i18n for applicant DMs. The applicant's locale is stored on
 * the User (Discord OAuth maps to de/en). Custom guild status labels come from
 * the notification payload; only the built-in pipeline is localized here.
 */

type Locale = "de" | "en";

interface DmStrings {
  statusNow: (label: string) => string;
  newMessage: (message: string) => string;
  viewStatus: string;
  title: string;
  builtinStatus: Record<string, string>;
}

const STRINGS: Record<Locale, DmStrings> = {
  en: {
    statusNow: (l) => `Your status is now **${l}**.`,
    newMessage: (m) => `New message from the team:\n\n> ${m}`,
    viewStatus: "View status",
    title: "Your submission",
    builtinStatus: {
      submitted: "Submitted",
      in_review: "In review",
      on_hold: "On hold",
      accepted: "Accepted",
      rejected: "Rejected",
      withdrawn: "Withdrawn",
    },
  },
  de: {
    statusNow: (l) => `Dein Status ist jetzt **${l}**.`,
    newMessage: (m) => `Neue Nachricht vom Team:\n\n> ${m}`,
    viewStatus: "Status ansehen",
    title: "Deine Einreichung",
    builtinStatus: {
      submitted: "Eingereicht",
      in_review: "In Prüfung",
      on_hold: "Zurückgestellt",
      accepted: "Angenommen",
      rejected: "Abgelehnt",
      withdrawn: "Zurückgezogen",
    },
  },
};

/** DM strings for an applicant's locale (defaults to English). */
export function dmStrings(locale: string | null | undefined): DmStrings {
  return STRINGS[locale === "de" ? "de" : "en"];
}

/**
 * Localize a status for the applicant: a built-in status key is translated to
 * their locale; a custom guild status falls back to the label snapshot from the
 * notification payload (written in the reviewer's locale).
 */
export function localizedStatus(
  locale: string | null | undefined,
  statusKey: string | undefined,
  fallbackLabel: string | undefined,
): string {
  const builtin = statusKey ? dmStrings(locale).builtinStatus[statusKey] : undefined;
  return builtin ?? fallbackLabel ?? statusKey ?? "";
}
