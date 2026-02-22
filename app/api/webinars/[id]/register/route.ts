import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: Params) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const admin = createSupabaseAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: webinar, error: webinarError } = await admin
    .from("webinars")
    .select("id, slug, capacity, registration_deadline, is_premium, price")
    .eq("id", id)
    .maybeSingle();

  if (webinarError || !webinar) {
    return NextResponse.json({ error: "Webinar not found" }, { status: 404 });
  }

  const deadline = webinar.registration_deadline
    ? new Date(webinar.registration_deadline).getTime()
    : Number.MAX_SAFE_INTEGER;
  if (Date.now() > deadline) {
    return NextResponse.json({ error: "Registration deadline passed" }, { status: 400 });
  }

  const requiresPayment =
    Boolean(webinar.is_premium) || Number(webinar.price ?? 0) > 0;
  if (requiresPayment) {
    const { data: payment } = await admin
      .from("payments")
      .select("id, status")
      .eq("user_id", user.id)
      .eq("product_type", "webinar")
      .eq("product_id", webinar.id)
      .in("status", ["paid", "succeeded", "complete", "success"])
      .maybeSingle();

    if (!payment) {
      return NextResponse.json(
        {
          error: "Payment required for this webinar.",
          checkoutRequired: true,
          webinarId: webinar.id,
          webinarSlug: webinar.slug,
        },
        { status: 402 },
      );
    }
  }

  const { count } = await admin
    .from("webinar_registrations")
    .select("*", { head: true, count: "exact" })
    .eq("webinar_id", webinar.id)
    .eq("status", "confirmed");

  if ((count ?? 0) >= (webinar.capacity ?? 0)) {
    return NextResponse.json({ error: "Seat limit reached" }, { status: 400 });
  }

  const { error } = await admin.from("webinar_registrations").insert({
    webinar_id: webinar.id,
    user_id: user.id,
    status: "confirmed",
  });

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "User already registered" }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to register" }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
