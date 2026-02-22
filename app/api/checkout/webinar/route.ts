import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { checkoutWebinarSchema } from "@/lib/validation/admin";
import { buildSiteUrl, createCheckoutSession } from "@/lib/payments/stripe";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = checkoutWebinarSchema.safeParse(await request.json());
  if (!payload.success) {
    return NextResponse.json(
      { error: payload.error.issues[0]?.message ?? "Invalid request body." },
      { status: 400 },
    );
  }

  const input = payload.data;
  const admin = createSupabaseAdminClient();

  const { data: webinar, error: webinarError } = await admin
    .from("webinars")
    .select("id,slug,title,capacity,price,is_premium,registration_deadline")
    .eq("id", input.webinarId)
    .maybeSingle();

  if (webinarError || !webinar) {
    return NextResponse.json({ error: "Webinar not found." }, { status: 404 });
  }

  const deadline = webinar.registration_deadline
    ? new Date(webinar.registration_deadline).getTime()
    : Number.MAX_SAFE_INTEGER;
  if (Date.now() > deadline) {
    return NextResponse.json({ error: "Registration deadline passed." }, { status: 400 });
  }

  const [{ count }, existingRegistration] = await Promise.all([
    admin
      .from("webinar_registrations")
      .select("*", { head: true, count: "exact" })
      .eq("webinar_id", webinar.id)
      .eq("status", "confirmed"),
    admin
      .from("webinar_registrations")
      .select("id")
      .eq("webinar_id", webinar.id)
      .eq("user_id", user.id)
      .eq("status", "confirmed")
      .maybeSingle(),
  ]);

  if (existingRegistration.data?.id) {
    return NextResponse.json({ ok: true, alreadyRegistered: true });
  }

  if ((count ?? 0) >= Number(webinar.capacity ?? 0)) {
    return NextResponse.json({ error: "Seat limit reached." }, { status: 400 });
  }

  const amountCents = Math.round(Number(webinar.price ?? 0) * 100);
  const requiresPayment = Boolean(webinar.is_premium) || amountCents > 0;
  if (requiresPayment && amountCents < 50) {
    return NextResponse.json(
      { error: "Premium webinar price must be at least $0.50." },
      { status: 400 },
    );
  }

  if (!requiresPayment) {
    const { error: registrationError } = await admin.from("webinar_registrations").insert({
      webinar_id: webinar.id,
      user_id: user.id,
      status: "confirmed",
    });

    if (registrationError && registrationError.code !== "23505") {
      return NextResponse.json({ error: registrationError.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, type: "free_registration", webinarId: webinar.id });
  }

  try {
    const siteUrl = buildSiteUrl(request);
    const successPath = input.successPath || `/webinars/${webinar.slug}`;
    const cancelPath = input.cancelPath || `/webinars/${webinar.slug}`;

    const session = await createCheckoutSession({
      amountCents,
      currency: "usd",
      productName: webinar.title ?? "IFX Premium Webinar Access",
      userId: user.id,
      metadata: {
        flow: "webinar_purchase",
        user_id: user.id,
        webinar_id: webinar.id,
      },
      successUrl: `${siteUrl}${successPath}?checkout=success`,
      cancelUrl: `${siteUrl}${cancelPath}?checkout=cancelled`,
    });

    return NextResponse.json({ checkoutUrl: session.url, sessionId: session.id });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Checkout initialization failed." },
      { status: 500 },
    );
  }
}
