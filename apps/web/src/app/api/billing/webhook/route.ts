import { prisma } from "@msk-forms/db";
import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";

import { buildOrderConfirmation, pickMailLang } from "@/lib/emails/order-confirmation";
import { sendMail } from "@/lib/mail";
import { formatSubscriptionPrice, stripe, tierForPrice, webhookSecret } from "@/lib/stripe";
import { appBaseUrl } from "@/lib/url";

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
 * Send the order confirmation required by § 312f BGB, exactly once per
 * subscription.
 *
 * A mail cannot be made idempotent the way the rest of this handler is, by
 * writing the same state twice, and Stripe delivers events more than once. So
 * the guild row carries a send lock: whoever manages to claim it with this
 * subscription id sends, everyone else returns. If sending fails the lock is
 * released again and the error is rethrown, which makes Stripe retry.
 *
 * Without SMTP configured sendMail returns false and logs. The subscription is
 * still live and the customer still has the platform; the confirmation is then
 * simply missing, which is a thing to fix in the environment rather than a
 * reason to fail the webhook.
 */
async function sendOrderConfirmation(
  client: Stripe,
  guildId: string,
  sub: Stripe.Subscription,
): Promise<void> {
  // Claim the lock. The explicit OR is deliberate: `{ not: id }` alone would
  // never match a row where the column is still NULL, which is every guild
  // ordering for the first time.
  const claimed = await prisma.guild.updateMany({
    where: {
      id: guildId,
      OR: [{ orderConfirmationSubId: null }, { orderConfirmationSubId: { not: sub.id } }],
    },
    data: { orderConfirmationSubId: sub.id },
  });
  if (claimed.count === 0) return;

  const release = async () => {
    await prisma.guild.updateMany({
      where: { id: guildId, orderConfirmationSubId: sub.id },
      data: { orderConfirmationSubId: null },
    });
  };

  try {
    const id = customerId(sub.customer as string | { id: string } | null);
    const customer = id ? await client.customers.retrieve(id) : null;
    const to = customer && !customer.deleted ? (customer.email ?? "") : "";
    if (!to) {
      console.warn(`[stripe] no customer email for guild ${guildId}, cannot confirm the order`);
      await release();
      return;
    }

    const lang = pickMailLang(customer && !customer.deleted ? customer.preferred_locales : null);
    const guild = await prisma.guild.findUnique({
      where: { id: guildId },
      select: { name: true },
    });
    const tier = tierForPrice(sub.items?.data?.[0]?.price?.id);

    await sendMail({
      to,
      ...buildOrderConfirmation({
        lang,
        planLabel: tier === "enterprise" ? "Enterprise" : "Pro",
        guildLabel: guild?.name ?? guildId,
        price: formatSubscriptionPrice(sub, lang),
        dashboardUrl: `${appBaseUrl()}/dashboard/${guildId}/forms`,
      }),
    });
  } catch (err) {
    await release();
    throw err;
  }
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
          // Derive the tier from the subscription's price (pro vs enterprise).
          const tier = tierForPrice(sub.items?.data?.[0]?.price?.id);
          await prisma.guild.update({
            where: { id: guildId },
            data: {
              plan: ACTIVE.has(sub.status) ? tier : "free",
              stripeSubscriptionId: sub.id,
            },
          });
          // Confirm the contract once it is actually live. Hooked here rather
          // than on checkout.session.completed because that event carries no
          // price and no status, and this one arrives for both a fresh order
          // and a Pro to Enterprise change.
          if (ACTIVE.has(sub.status)) await sendOrderConfirmation(client, guildId, sub);
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
