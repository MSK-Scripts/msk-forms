import type { Dictionary } from "@/i18n";

import type { SubmissionsTableLabels } from "./submissions-table";

/**
 * The copy of SubmissionsTable, shared by the submission list and the archived
 * list. A plain module (not "use client"), so server pages can call it.
 */
export function submissionsTableLabels(dict: Dictionary, caption: string): SubmissionsTableLabels {
  const t = dict.dashboard;
  const l = t.submissionsList;
  return {
    caption,
    colApplicant: t.colApplicant,
    colForm: t.colForm,
    colDate: t.colDate,
    colStatus: t.colStatus,
    colScore: t.colScore,
    actions: t.formsList.actions,
    anonymous: t.anonymous,
    notScored: l.notScored,
    open: t.open,
    archive: t.archive,
    restore: t.restore,
    archivedOne: l.archivedOne,
    restoredOne: l.restoredOne,
    selectAll: l.selectAll,
    selectOne: l.selectOne,
    selected: t.bulk.selected,
    bulkLabel: l.bulkLabel,
    clearSelection: l.clearSelection,
    apply: t.bulk.apply,
    applying: t.bulk.applying,
    moveTo: t.board.moveTo,
    bulkDone: l.bulkDone,
    bulkFailed: t.bulk.failed,
    allForms: t.allForms,
    dismiss: dict.kit.dismiss,
  };
}
