import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { checkoutAlgoSchema } from "@/lib/validation/admin";
import { buildSiteUrl, createCheckoutSession } from "@/lib/payments/stripe";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = checkoutAlgoSchema.safeParse(await request.json());
  if (!payload.success) {
    return NextResponse.json(
      { error: payload.error.issues[0]?.message ?? "Invalid request body." },
      { status: 400 },
    );
  }

  const input = payload.data;
  const admin = createSupabaseAdminClient();
  const { data: algo, error: algoError } = await admin
    .from("algorithms")
    .select("id,slug,name,price,is_active")
    .eq("id", input.algoId)
    .maybeSingle();

  if (algoError || !algo) {
    return NextResponse.json({ error: "Algorithm not found." }, { status: 404 });
  }

  if (!algo.is_active) {
    return NextResponse.json({ error: "Algorithm is not active." }, { status: 400 });
  }

  const amountCents = Math.round(Number(algo.price ?? 0) * 100);
  if (amountCents <= 0) {
    const nowIso = new Date().toISOString();
    const oneYearIso = new Date(Date.now() + 365 * 86400000).toISOString();

    const { error: licenseError } = await admin.from("algo_licenses").insert({
      user_id: user.id,
      algo_id: algo.id,
      status: "active",
      starts_at: nowIso,
      expires_at: oneYearIso,
      purchased_at: nowIso,
    });

    if (licenseError && licenseError.code !== "23505") {
      return NextResponse.json({ error: licenseError.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, type: "free_license", algoId: algo.id });
  }

  if (amountCents < 50) {
    return NextResponse.json(
      { error: "Algorithm price must be at least $0.50." },
      { status: 400 },
    );
  }

  try {
    const siteUrl = buildSiteUrl(request);
    const successPath = input.successPath || "/dashboard/licenses";
    const cancelPath = input.cancelPath || `/algos/${algo.slug ?? algo.id}`;

    const session = await createCheckoutSession({
      amountCents,
      currency: "usd",
      productName: algo.name ?? "IFX Algorithm License",
      userId: user.id,
      metadata: {
        flow: "algo_purchase",
        user_id: user.id,
        algo_id: algo.id,
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
