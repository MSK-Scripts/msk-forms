"use server";

import type { Route } from "next";
import { redirect } from "next/navigation";

import { getSession } from "@/lib/session";

/**
 * Server Action logout: destroys the session cookie and redirects home.
 * Works via progressive enhancement (native form POST) even without client JS.
 */
export async function logoutAction() {
  const session = await getSession();
  session.destroy();
  redirect("/" as Route);
}
