import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  getStripeWebhookSecret,
  verifyStripeWebhookSignature,
} from "@/lib/payments/stripe";
import { stripeWebhookSessionSchema } from "@/lib/validation/admin";

type StripeEvent = {
  id: string;
  type: string;
  data: { object: unknown };
};

async function persistPaymentEvent(input: {
  userId: string;
  amountUsd: number;
  currency: string;
  status: string;
  productType: "algo" | "webinar";
  productId: string;
}) {
  const admin = createSupabaseAdminClient();
  await admin.from("payments").insert({
    user_id: input.userId,
    amount: input.amountUsd,
    currency: input.currency,
    status: input.status,
    product_type: input.productType,
    product_id: input.productId,
  });
}

export async function POST(request: Request) {
  let webhookSecret = "";
  try {
    webhookSecret = getStripeWebhookSecret();
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Stripe webhook is not configured." },
      { status: 500 },
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header." }, { status: 400 });
  }

  const payload = await request.text();
  const validSignature = verifyStripeWebhookSignature(payload, signature, webhookSecret);
  if (!validSignature) {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
  }

  const event = JSON.parse(payload) as StripeEvent;

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true, ignored: event.type });
  }

  const parsedSession = stripeWebhookSessionSchema.safeParse(event.data.object);
  if (!parsedSession.success) {
    return NextResponse.json({ error: "Invalid checkout session payload." }, { status: 400 });
  }

  const session = parsedSession.data;
  const metadata = session.metadata ?? {};
  const flow = metadata.flow;
  const userId = metadata.user_id;
  const algoId = metadata.algo_id;
  const webinarId = metadata.webinar_id;

  if (!userId || !flow) {
    return NextResponse.json({ error: "Missing required metadata." }, { status: 400 });
  }

  const amountUsd = Number(session.amount_total ?? 0) / 100;
  const currency = String(session.currency ?? "usd").toUpperCase();
  const status = String(session.payment_status ?? "paid");

  const admin = createSupabaseAdminClient();

  try {
    if (flow === "algo_purchase" && algoId) {
      await persistPaymentEvent({
        userId,
        amountUsd,
        currency,
        status,
        productType: "algo",
        productId: algoId,
      });

      const nowIso = new Date().toISOString();
      const oneYearIso = new Date(Date.now() + 365 * 86400000).toISOString();
      const { error } = await admin.from("algo_licenses").insert({
        user_id: userId,
        algo_id: algoId,
        status: "active",
        starts_at: nowIso,
        expires_at: oneYearIso,
        purchased_at: nowIso,
      });

      if (error && error.code !== "23505") {
        throw new Error(error.message);
      }
    }

    if (flow === "webinar_purchase" && webinarId) {
      await persistPaymentEvent({
        userId,
        amountUsd,
        currency,
        status,
        productType: "webinar",
        productId: webinarId,
      });

      const { error } = await admin.from("webinar_registrations").insert({
        webinar_id: webinarId,
        user_id: userId,
        status: "confirmed",
      });

      if (error && error.code !== "23505") {
        throw new Error(error.message);
      }
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Webhook processing failed." },
      { status: 400 },
    );
  }

  return NextResponse.json({ received: true, id: event.id });
}
