/**
 * Form scheduling (concept §26). A form can carry an optional open and/or close
 * time. Before `openAt` it's "scheduled" (not yet accepting), after `closeAt`
 * it's "closed", otherwise "open". A form that's open and closes soon is flagged
 * `endingSoon` so the UI can nudge applicants ("Ending soon!").
 */

export type FormScheduleState = "scheduled" | "open" | "closed";

/** A form counts as "ending soon" when it closes within this many hours. */
export const ENDING_SOON_HOURS = 24;

const HOUR_MS = 3_600_000;

export interface FormScheduleStatus {
  state: FormScheduleState;
  /** Open now and closing within ENDING_SOON_HOURS. */
  endingSoon: boolean;
  /** Milliseconds until it opens (null when already open/no open time or past). */
  msUntilOpen: number | null;
  /** Milliseconds until it closes (null when no close time). */
  msUntilClose: number | null;
}

function toMs(value: Date | string | null | undefined): number | null {
  if (value == null) return null;
  const ms = value instanceof Date ? value.getTime() : new Date(value).getTime();
  return Number.isNaN(ms) ? null : ms;
}

/** Resolve a form's schedule state relative to `now`. */
export function formScheduleStatus(
  openAt: Date | string | null | undefined,
  closeAt: Date | string | null | undefined,
  now: Date,
): FormScheduleStatus {
  const nowMs = now.getTime();
  const open = toMs(openAt);
  const close = toMs(closeAt);

  let state: FormScheduleState = "open";
  if (open !== null && nowMs < open) state = "scheduled";
  else if (close !== null && nowMs >= close) state = "closed";

  const msUntilClose = close !== null ? close - nowMs : null;
  const endingSoon =
    state === "open" && msUntilClose !== null && msUntilClose <= ENDING_SOON_HOURS * HOUR_MS;

  return {
    state,
    endingSoon,
    msUntilOpen: state === "scheduled" && open !== null ? open - nowMs : null,
    msUntilClose,
  };
}

/** True when a scheduled form may currently accept submissions. */
export function isFormOpenNow(
  openAt: Date | string | null | undefined,
  closeAt: Date | string | null | undefined,
  now: Date,
): boolean {
  return formScheduleStatus(openAt, closeAt, now).state === "open";
}
