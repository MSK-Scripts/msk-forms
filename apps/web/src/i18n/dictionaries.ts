export type Locale = "en" | "de";

const en = {
  header: { login: "Log in", dashboard: "Dashboard", logout: "Log out", toggleTheme: "Toggle theme", language: "Language" },
  footer: {
    tagline: "Application forms with a real status loop, by MSK Scripts.",
    product: "Product", ecosystem: "Ecosystem", legal: "Legal",
    demoForm: "Demo form", documentation: "Documentation", github: "GitHub",
    imprint: "Imprint", privacy: "Privacy Policy", terms: "Terms & Conditions",
    rights: "All rights reserved.",
  },
  hero: {
    badge: "Application platform",
    headPre: "Application forms with a real ", headAccent: "status loop", headPost: ".",
    sub: "Build a form, share a link, let applicants track their status live. With a Discord bot any server can invite.",
    loginDiscord: "Log in with Discord", demo: "View a demo form", openDashboard: "Open dashboard",
  },
  features: {
    title: "The part most form tools skip.",
    sub: "A form is easy. Telling people what happened after they hit submit is the hard part. That is the whole point of MSK Forms.",
    uspTitle: "Applicants always know where they stand.",
    uspBody:
      "Every submission gets a private link. The status updates the moment a reviewer acts, on the same page they applied. No more “did you see my application?”",
    sSubmitted: "Submitted", sInReview: "In review", sAccepted: "Accepted",
    botTitle: "A bot to invite",
    botBody: "Post forms to a channel and push status updates straight to applicants as DMs.",
    buildTitle: "Build without code",
    buildBody: "Compose forms from typed fields: text, choices, dates, consent. Ready in seconds.",
  },
  steps: {
    title: "From zero to live in three steps.",
    build: "Build", buildBody: "Drop in the fields you need and set who can submit.",
    share: "Share", shareBody: "Publish a link or post the form to Discord with the bot.",
    review: "Review", reviewBody: "Accept, reject, or ask for more. Applicants see it live.",
  },
  cta: {
    title: "Start collecting applications people can actually follow.",
    openDashboard: "Open dashboard", loginDiscord: "Log in with Discord",
  },
  form: {
    notAccepting: "This form is not accepting responses right now.",
    needLogin: "You need to sign in to fill out this form.",
    loginDiscord: "Log in with Discord",
    accessRestricted: "This form uses an access restriction that isn’t supported yet.",
    submit: "Submit", submitting: "Submitting…", required: "This field is required.",
    submitFailed: "Submission failed.",
  },
  status: {
    yourSubmission: "Your submission", activity: "Activity", yourAnswers: "Your answers",
    submitted: "Submitted", notAnswered: "Not answered", statusChangedTo: "Status changed to", update: "Update",
    yes: "Yes", no: "No",
  },
  preview: {
    submission: "Your submission", title: "Whitelist application", inReview: "In review",
    submitted: "Submitted", pickedUp: "Picked up by a reviewer", decision: "Decision",
    pending: "pending", reviewerNote: "Reviewer note",
    note: "Looks solid. Confirming your in-game name, then you’re in.",
  },
  authError: "Login failed. Please try again.",
};

export type Dictionary = typeof en;

const de: Dictionary = {
  header: { login: "Anmelden", dashboard: "Dashboard", logout: "Abmelden", toggleTheme: "Theme wechseln", language: "Sprache" },
  footer: {
    tagline: "Formulare mit echtem Status-Loop, von MSK Scripts.",
    product: "Produkt", ecosystem: "Ökosystem", legal: "Rechtliches",
    demoForm: "Demo-Formular", documentation: "Dokumentation", github: "GitHub",
    imprint: "Impressum", privacy: "Datenschutz", terms: "AGB",
    rights: "Alle Rechte vorbehalten.",
  },
  hero: {
    badge: "Formulare-Plattform",
    headPre: "Formulare mit echtem ", headAccent: "Status-Loop", headPost: ".",
    sub: "Formular bauen, Link teilen, Bewerber sehen ihren Status live. Mit einem Discord-Bot, den jeder Server einladen kann.",
    loginDiscord: "Mit Discord anmelden", demo: "Demo-Formular ansehen", openDashboard: "Zum Dashboard",
  },
  features: {
    title: "Der Teil, den die meisten Formular-Tools auslassen.",
    sub: "Ein Formular ist leicht. Den Leuten zu sagen, was nach dem Absenden passiert, ist der schwere Teil. Genau darum geht es bei MSK Forms.",
    uspTitle: "Bewerber wissen immer, woran sie sind.",
    uspBody:
      "Jede Einreichung bekommt einen privaten Link. Der Status aktualisiert sich, sobald ein Reviewer handelt — auf derselben Seite, auf der sie sich beworben haben. Kein „Hast du meine Bewerbung gesehen?“ mehr.",
    sSubmitted: "Eingereicht", sInReview: "In Prüfung", sAccepted: "Angenommen",
    botTitle: "Ein Bot zum Einladen",
    botBody: "Poste Formulare in einen Kanal und schicke Status-Updates direkt als DM an Bewerber.",
    buildTitle: "Ohne Code bauen",
    buildBody: "Formulare aus typisierten Feldern zusammenstellen: Text, Auswahl, Datum, Zustimmung. In Sekunden fertig.",
  },
  steps: {
    title: "In drei Schritten live.",
    build: "Bauen", buildBody: "Felder reinziehen und festlegen, wer einreichen darf.",
    share: "Teilen", shareBody: "Link veröffentlichen oder das Formular per Bot in Discord posten.",
    review: "Prüfen", reviewBody: "Annehmen, ablehnen oder nachfragen. Bewerber sehen es live.",
  },
  cta: {
    title: "Sammle Bewerbungen, die man wirklich verfolgen kann.",
    openDashboard: "Zum Dashboard", loginDiscord: "Mit Discord anmelden",
  },
  form: {
    notAccepting: "Dieses Formular nimmt aktuell keine Antworten an.",
    needLogin: "Du musst dich anmelden, um dieses Formular auszufüllen.",
    loginDiscord: "Mit Discord anmelden",
    accessRestricted: "Dieses Formular nutzt eine Zugangsbeschränkung, die noch nicht unterstützt wird.",
    submit: "Absenden", submitting: "Wird gesendet…", required: "Dieses Feld ist erforderlich.",
    submitFailed: "Senden fehlgeschlagen.",
  },
  status: {
    yourSubmission: "Deine Einreichung", activity: "Aktivität", yourAnswers: "Deine Antworten",
    submitted: "Eingereicht", notAnswered: "Nicht beantwortet", statusChangedTo: "Status geändert zu", update: "Update",
    yes: "Ja", no: "Nein",
  },
  preview: {
    submission: "Deine Einreichung", title: "Whitelist-Bewerbung", inReview: "In Prüfung",
    submitted: "Eingereicht", pickedUp: "Von einem Reviewer übernommen", decision: "Entscheidung",
    pending: "ausstehend", reviewerNote: "Reviewer-Notiz",
    note: "Sieht gut aus. Wir bestätigen deinen In-Game-Namen, dann bist du dabei.",
  },
  authError: "Anmeldung fehlgeschlagen. Bitte versuche es erneut.",
};

export const dictionaries: Record<Locale, Dictionary> = { en, de };
