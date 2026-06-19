/** Standard-Status-Pipeline (Konzept.md §10). */
export const DEFAULT_STATUSES = [
  { key: "submitted", label: "Eingegangen", color: "#6b6b72", terminal: false },
  { key: "in_review", label: "In Prüfung", color: "#00E676", terminal: false },
  { key: "on_hold", label: "Zurückgestellt", color: "#f5a623", terminal: false },
  { key: "accepted", label: "Angenommen", color: "#00E676", terminal: true },
  { key: "rejected", label: "Abgelehnt", color: "#ff5252", terminal: true },
  { key: "withdrawn", label: "Zurückgezogen", color: "#6b6b72", terminal: true },
] as const;

export const SUPPORTED_LOCALES = ["de", "en"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "de";
