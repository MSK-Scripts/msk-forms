/**
 * Bot-side i18n for applicant DMs. The applicant's locale is stored on the User
 * (Discord OAuth locale → one of our 7 app locales via `mapLocale`). Custom
 * guild status labels come from the notification payload; only the built-in
 * pipeline is localized here. Built-in status labels mirror the web's
 * `statusLabels` (apps/web/src/i18n/dictionaries.ts) so DMs match the site.
 */

type Locale = "en" | "de" | "hu" | "fr" | "es" | "pt" | "pl";

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
  hu: {
    statusNow: (l) => `Az állapotod most: **${l}**.`,
    newMessage: (m) => `Új üzenet a csapattól:\n\n> ${m}`,
    viewStatus: "Állapot megtekintése",
    title: "A beküldésed",
    builtinStatus: {
      submitted: "Beküldve",
      in_review: "Elbírálás alatt",
      on_hold: "Várakozik",
      accepted: "Elfogadva",
      rejected: "Elutasítva",
      withdrawn: "Visszavonva",
    },
  },
  fr: {
    statusNow: (l) => `Votre statut est désormais **${l}**.`,
    newMessage: (m) => `Nouveau message de l’équipe :\n\n> ${m}`,
    viewStatus: "Voir le statut",
    title: "Votre candidature",
    builtinStatus: {
      submitted: "Envoyé",
      in_review: "En cours d'examen",
      on_hold: "En attente",
      accepted: "Accepté",
      rejected: "Refusé",
      withdrawn: "Retiré",
    },
  },
  es: {
    statusNow: (l) => `Tu estado ahora es **${l}**.`,
    newMessage: (m) => `Nuevo mensaje del equipo:\n\n> ${m}`,
    viewStatus: "Ver estado",
    title: "Tu envío",
    builtinStatus: {
      submitted: "Enviado",
      in_review: "En revisión",
      on_hold: "En espera",
      accepted: "Aceptado",
      rejected: "Rechazado",
      withdrawn: "Retirado",
    },
  },
  pt: {
    statusNow: (l) => `Seu status agora é **${l}**.`,
    newMessage: (m) => `Nova mensagem da equipe:\n\n> ${m}`,
    viewStatus: "Ver status",
    title: "Seu envio",
    builtinStatus: {
      submitted: "Enviado",
      in_review: "Em análise",
      on_hold: "Em espera",
      accepted: "Aceito",
      rejected: "Rejeitado",
      withdrawn: "Retirado",
    },
  },
  pl: {
    statusNow: (l) => `Twój status to teraz **${l}**.`,
    newMessage: (m) => `Nowa wiadomość od zespołu:\n\n> ${m}`,
    viewStatus: "Zobacz status",
    title: "Twoje zgłoszenie",
    builtinStatus: {
      submitted: "Zgłoszono",
      in_review: "W trakcie recenzji",
      on_hold: "Wstrzymano",
      accepted: "Zaakceptowano",
      rejected: "Odrzucono",
      withdrawn: "Wycofano",
    },
  },
};

/** DM strings for an applicant's locale (defaults to English). */
export function dmStrings(locale: string | null | undefined): DmStrings {
  return locale && locale in STRINGS ? STRINGS[locale as Locale] : STRINGS.en;
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
