import "server-only";

import { prisma } from "@msk-forms/db";
import { headers } from "next/headers";

import { appBaseUrl } from "./url";

/** Bare hostname (lowercased, no port, no trailing dot). */
function hostname(host: string): string {
  return host.toLowerCase().split(":")[0]!.replace(/\.$/, "");
}

/** The canonical app hostname (from APP_URL). */
export function primaryHostname(): string {
  try {
    return hostname(new URL(appBaseUrl()).host);
  } catch {
    return "localhost";
  }
}

/** The request's Host header as a bare hostname, or null. */
export async function requestHostname(): Promise<string | null> {
  const host = (await headers()).get("host");
  return host ? hostname(host) : null;
}

/** True for the canonical app host or any local dev host. */
export function isPrimaryHostname(host: string): boolean {
  return host === primaryHostname() || host === "localhost" || host === "127.0.0.1";
}

/** A guild resolved from the custom domain it owns. */
export interface DomainGuild {
  id: string;
  name: string;
  branding: unknown;
}

/**
 * Resolve a verified guild that owns this custom-domain host, or null (unknown
 * host, the primary host, or an unverified domain). Used to scope and brand
 * custom-domain requests.
 */
export async function getGuildByDomain(host: string): Promise<DomainGuild | null> {
  if (isPrimaryHostname(host)) return null;
  return prisma.guild.findFirst({
    where: { customDomain: host, customDomainVerifiedAt: { not: null } },
    select: { id: true, name: true, branding: true },
  });
}
