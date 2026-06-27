import "server-only";

import { unstable_cache } from "next/cache";

import { prisma } from "@msk-forms/db";

// Anonymized aggregate count of Discord servers using MSK Forms. Guild rows only
// exist for servers that have invited the bot, so this is a truthful "active"
// number. Cached for 5 minutes so the (force-dynamic) landing page doesn't hit
// the DB on every request. Fail-soft: returns 0 if the count can't be read.
export const getActiveServerCount = unstable_cache(
  async (): Promise<number> => {
    try {
      return await prisma.guild.count();
    } catch {
      return 0;
    }
  },
  ["stats:active-server-count"],
  { revalidate: 300 },
);
