import type { Dictionary } from "@/i18n";

import type { DateFieldLabels } from "./date-field";
import type { FormLabels } from "./form-renderer";

/**
 * The copy of the form renderer from the dictionary, in one place. Server
 * components build it and hand it to the client renderer as props; the
 * public form page, the manager's preview and the builder's date pickers use
 * the same set, so a new string cannot be forgotten in one of them.
 */
export function formLabels(dict: Dictionary): FormLabels {
  const t = dict.form;
  const p = dict.publicForm;
  return {
    submit: t.submit,
    submitting: t.submitting,
    required: t.required,
    submitFailed: t.submitFailed,
    captchaRequired: t.captchaRequired,
    fileUploading: t.fileUploading,
    fileRemove: t.fileRemove,
    uploadFailed: t.uploadFailed,
    signatureClear: t.signatureClear,
    next: t.next,
    back: t.back,
    step: t.step,
    dateToday: t.dateToday,
    dateClear: t.dateClear,
    dateNow: t.dateNow,
    dateEmpty: p.dateEmpty,
    timeEmpty: p.timeEmpty,
    datetimeEmpty: p.datetimeEmpty,
    prevMonth: p.prevMonth,
    nextMonth: p.nextMonth,
    hour: p.hour,
    minute: p.minute,
    previewNote: t.previewNote,
    yes: t.yes,
    no: t.no,
    selectPlaceholder: p.selectPlaceholder,
    agree: p.agree,
    calculatedEmpty: p.calculatedEmpty,
    countryCode: p.countryCode,
    uploaded: p.uploaded,
  };
}

/** The date picker's copy alone, for the builder's schedule fields. */
export function dateLabels(dict: Dictionary): DateFieldLabels {
  const l = formLabels(dict);
  return {
    today: l.dateToday,
    clear: l.dateClear,
    now: l.dateNow,
    empty: { date: l.dateEmpty, time: l.timeEmpty, datetime: l.datetimeEmpty },
    prevMonth: l.prevMonth,
    nextMonth: l.nextMonth,
    hour: l.hour,
    minute: l.minute,
  };
}
