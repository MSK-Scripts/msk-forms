import { prisma } from "@msk-forms/db";
import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";

import { stripe, webhookSecret } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Subscription statuses that grant Pro. */
const ACTIVE = new Set(["active", "trialing"]);

function customerId(c: string | { id: string } | null): string | null {
  return typeof c === "string" ? c : (c?.id ?? null);
}

/** Find the guild a Stripe object belongs to: metadata first, then customer id. */
async function resolveGuildId(
  metadataGuildId: string | undefined,
  customer: string | null,
): Promise<string | null> {
  if (metadataGuildId) return metadataGuildId;
  if (!customer) return null;
  const guild = await prisma.guild.findUnique({
    where: { stripeCustomerId: customer },
    select: { id: true },
  });
  return guild?.id ?? null;
}

/**
 * Stripe webhook. Verifies the signature against STRIPE_WEBHOOK_SECRET, then
 * maps subscription lifecycle events onto the guild's plan. Grandfathered guilds
 * stay Pro regardless (resolved in lib/plan.ts), so a downgrade here is safe.
 */
export async function POST(request: NextRequest) {
  const client = stripe();
  const secret = webhookSecret();
  if (!client || !secret) {
    return NextResponse.json({ error: "Billing is not configured." }, { status: 503 });
  }

  const sig = request.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "Missing signature." }, { status: 400 });

  let event: Stripe.Event;
  try {
    const raw = await request.text();
    event = client.webhooks.constructEvent(raw, sig, secret);
  } catch (err) {
    console.error("[stripe] webhook signature check failed:", (err as Error).message);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const guildId = session.client_reference_id ?? undefined;
        const customer = customerId(session.customer as string | { id: string } | null);
        if (guildId && customer) {
          await prisma.guild.update({
            where: { id: guildId },
            data: { stripeCustomerId: customer },
          });
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const guildId = await resolveGuildId(sub.metadata?.guildId, customerId(sub.customer));
        if (guildId) {
          await prisma.guild.update({
            where: { id: guildId },
            data: {
              plan: ACTIVE.has(sub.status) ? "pro" : "free",
              stripeSubscriptionId: sub.id,
            },
          });
        }
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const guildId = await resolveGuildId(sub.metadata?.guildId, customerId(sub.customer));
        if (guildId) {
          await prisma.guild.update({
            where: { id: guildId },
            data: { plan: "free", stripeSubscriptionId: null },
          });
        }
        break;
      }
      default:
        break;
    }
  } catch (err) {
    console.error(`[stripe] handler error for ${event.type}:`, (err as Error).message);
    return NextResponse.json({ error: "Handler error." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
