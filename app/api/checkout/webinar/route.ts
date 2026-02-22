import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json();
  if (!payload?.webinarId) {
    return NextResponse.json({ error: "webinarId is required." }, { status: 400 });
  }

  return NextResponse.json(
    {
      error:
        "Stripe checkout integration is not configured in this repository. Configure Stripe keys and webhook signing secret to enable premium webinar payments.",
    },
    { status: 501 },
  );
}
