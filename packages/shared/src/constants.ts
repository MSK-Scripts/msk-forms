/** Default status pipeline (concept §10). */
export const DEFAULT_STATUSES = [
  { key: "submitted", label: "Submitted", color: "#6b6b72", terminal: false },
  { key: "in_review", label: "In review", color: "#00E676", terminal: false },
  { key: "on_hold", label: "On hold", color: "#f5a623", terminal: false },
  { key: "accepted", label: "Accepted", color: "#00E676", terminal: true },
  { key: "rejected", label: "Rejected", color: "#ff5252", terminal: true },
  { key: "withdrawn", label: "Withdrawn", color: "#6b6b72", terminal: true },
] as const;

export const SUPPORTED_LOCALES = ["de", "en"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "de";
