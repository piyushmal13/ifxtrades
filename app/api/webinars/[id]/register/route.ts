import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: Params) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: webinar, error: webinarError } = await supabase
    .from("webinars")
    .select("id, capacity, registration_deadline")
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

  const { count } = await supabase
    .from("webinar_registrations")
    .select("*", { head: true, count: "exact" })
    .eq("webinar_id", webinar.id)
    .eq("status", "confirmed");

  if ((count ?? 0) >= (webinar.capacity ?? 0)) {
    return NextResponse.json({ error: "Seat limit reached" }, { status: 400 });
  }

  const { error } = await supabase.from("webinar_registrations").insert({
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
