import { isReservedHandle, normalizeHandle } from "@msk-forms/shared";
import { notFound } from "next/navigation";

import { GuildHub } from "@/components/public/guild-hub";
import { getGuildByHandle } from "@/lib/forms";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Public per-guild form hub at a vanity path on the primary domain, e.g.
 * forms.msk-scripts.de/msk-forms. Explicit top-level routes (dashboard, f, s,
 * g, pricing, ...) win over this dynamic segment, and reserved names are
 * rejected, so a handle can only point at a guild's hub.
 */
export default async function HandleHubPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle: raw } = await params;
  const handle = normalizeHandle(decodeURIComponent(raw));
  if (!handle || isReservedHandle(handle)) notFound();

  const guild = await getGuildByHandle(handle);
  if (!guild) notFound();
  return <GuildHub guild={guild} />;
}
