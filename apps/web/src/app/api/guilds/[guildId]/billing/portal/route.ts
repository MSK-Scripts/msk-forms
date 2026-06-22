import { prisma } from "@msk-forms/db";
import { NextResponse, type NextRequest } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { canManageForms } from "@/lib/guild";
import { stripe, stripeEnabled } from "@/lib/stripe";
import { appBaseUrl } from "@/lib/url";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Open the Stripe billing portal for a guild's subscription. Owner/admin only. */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ guildId: string }> },
) {
  const { guildId } = await params;

  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  if (!(await canManageForms(guildId, user.id))) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const client = stripe();
  if (!stripeEnabled() || !client) {
    return NextResponse.json({ error: "Billing is not configured." }, { status: 503 });
  }

  const guild = await prisma.guild.findUnique({
    where: { id: guildId },
    select: { stripeCustomerId: true },
  });
  if (!guild?.stripeCustomerId) {
    return NextResponse.json({ error: "No billing account." }, { status: 400 });
  }

  const session = await client.billingPortal.sessions.create({
    customer: guild.stripeCustomerId,
    return_url: `${appBaseUrl()}/dashboard/${guildId}/forms`,
  });
  return NextResponse.json({ url: session.url });
}
