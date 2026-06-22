import { prisma } from "@msk-forms/db";
import { NextResponse, type NextRequest } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { canManageForms } from "@/lib/guild";
import { isGuildPro } from "@/lib/plan";
import { proPriceId, stripe, stripeEnabled } from "@/lib/stripe";
import { appBaseUrl } from "@/lib/url";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Start a Stripe Checkout session to upgrade a guild to Pro. Owner/admin only. */
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
  const price = proPriceId();
  if (!stripeEnabled() || !client || !price) {
    return NextResponse.json({ error: "Billing is not configured." }, { status: 503 });
  }

  if (await isGuildPro(guildId)) {
    return NextResponse.json({ error: "Already on Pro." }, { status: 400 });
  }

  const guild = await prisma.guild.findUnique({
    where: { id: guildId },
    select: { name: true, stripeCustomerId: true },
  });
  if (!guild) return NextResponse.json({ error: "Guild not found." }, { status: 404 });

  // Reuse the guild's Stripe customer, or create one tied to the guild.
  let customerId = guild.stripeCustomerId;
  if (!customerId) {
    const customer = await client.customers.create({
      name: guild.name,
      metadata: { guildId },
    });
    customerId = customer.id;
    await prisma.guild.update({ where: { id: guildId }, data: { stripeCustomerId: customerId } });
  }

  const base = appBaseUrl();
  const session = await client.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price, quantity: 1 }],
    client_reference_id: guildId,
    subscription_data: { metadata: { guildId } },
    allow_promotion_codes: true,
    success_url: `${base}/dashboard/${guildId}/forms?upgraded=1`,
    cancel_url: `${base}/dashboard/${guildId}/forms`,
  });

  return NextResponse.json({ url: session.url });
}
