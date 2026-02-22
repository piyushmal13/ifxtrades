import crypto from "crypto";

type CheckoutInput = {
  amountCents: number;
  currency: string;
  productName: string;
  userId: string;
  metadata: Record<string, string>;
  successUrl: string;
  cancelUrl: string;
};

function getRequiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name} environment variable.`);
  }
  return value;
}

export function getStripeSecretKey() {
  return getRequiredEnv("STRIPE_SECRET_KEY");
}

export function getStripeWebhookSecret() {
  return getRequiredEnv("STRIPE_WEBHOOK_SECRET");
}

export function buildSiteUrl(request: Request) {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (envUrl) return envUrl.replace(/\/$/, "");
  return new URL(request.url).origin.replace(/\/$/, "");
}

export async function createCheckoutSession(input: CheckoutInput) {
  if (input.amountCents < 50) {
    throw new Error("Stripe amount must be at least 50 cents.");
  }

  const secretKey = getStripeSecretKey();
  const params = new URLSearchParams();

  params.set("mode", "payment");
  params.set("client_reference_id", input.userId);
  params.set("success_url", input.successUrl);
  params.set("cancel_url", input.cancelUrl);
  params.set("line_items[0][quantity]", "1");
  params.set("line_items[0][price_data][currency]", input.currency);
  params.set(
    "line_items[0][price_data][unit_amount]",
    String(input.amountCents),
  );
  params.set("line_items[0][price_data][product_data][name]", input.productName);

  for (const [key, value] of Object.entries(input.metadata)) {
    params.set(`metadata[${key}]`, value);
  }

  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message =
      body?.error?.message || "Stripe checkout session creation failed.";
    throw new Error(message);
  }

  return body as { id: string; url: string };
}

function parseStripeSignature(signatureHeader: string) {
  const chunks = signatureHeader.split(",");
  const timestamp = chunks
    .find((chunk) => chunk.startsWith("t="))
    ?.slice(2);
  const signatures = chunks
    .filter((chunk) => chunk.startsWith("v1="))
    .map((chunk) => chunk.slice(3));
  return { timestamp, signatures };
}

export function verifyStripeWebhookSignature(
  payload: string,
  signatureHeader: string,
  webhookSecret: string,
) {
  const { timestamp, signatures } = parseStripeSignature(signatureHeader);
  if (!timestamp || signatures.length === 0) return false;

  const signedPayload = `${timestamp}.${payload}`;
  const expected = crypto
    .createHmac("sha256", webhookSecret)
    .update(signedPayload, "utf8")
    .digest("hex");

  return signatures.some((signature) => {
    try {
      return crypto.timingSafeEqual(
        Buffer.from(signature, "hex"),
        Buffer.from(expected, "hex"),
      );
    } catch {
      return false;
    }
  });
}
