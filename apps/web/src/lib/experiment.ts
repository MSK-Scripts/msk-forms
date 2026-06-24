import "server-only";

import { prisma } from "@msk-forms/db";

/** Sticky-assignment cookie name for a form's A/B test. */
export function experimentCookieName(formId: string): string {
  return `msk_exp_${formId}`;
}

/** Increment a variant's view (assignment) counter. Best-effort. */
export async function recordExperimentView(formId: string, variantId: string): Promise<void> {
  try {
    await prisma.experimentStat.upsert({
      where: { formId_variantId: { formId, variantId } },
      create: { formId, variantId, views: 1 },
      update: { views: { increment: 1 } },
    });
  } catch {
    // Tracking must never break the form.
  }
}

/** Increment a variant's submission (conversion) counter. Best-effort. */
export async function recordExperimentConversion(formId: string, variantId: string): Promise<void> {
  try {
    await prisma.experimentStat.upsert({
      where: { formId_variantId: { formId, variantId } },
      create: { formId, variantId, submissions: 1 },
      update: { submissions: { increment: 1 } },
    });
  } catch {
    // Tracking must never break the submit.
  }
}
