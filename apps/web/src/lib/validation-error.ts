import "server-only";

import type { z } from "zod";

import { getDict, getLocale } from "@/i18n";

import { localizeIssue } from "./validation-message";

/**
 * The first problem of a rejected request body, in the viewer's language, for
 * the `error` of a dashboard route's 422. Undefined when there is none.
 */
export async function validationMessage(error: z.ZodError): Promise<string | undefined> {
  const issue = error.issues[0];
  if (!issue) return undefined;
  const [locale, dict] = await Promise.all([getLocale(), getDict()]);
  return localizeIssue(issue, locale, dict.validation);
}
