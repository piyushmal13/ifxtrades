import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ valid: false, reason: "unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const algoId = url.searchParams.get("algoId");
  if (!algoId) {
    return NextResponse.json({ valid: false, reason: "missing_algo_id" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("algo_licenses")
    .select("id, status, expires_at")
    .eq("user_id", user.id)
    .eq("algo_id", algoId)
    .eq("status", "active")
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ valid: false });
  }

  return NextResponse.json({
    valid: true,
    licenseId: data.id,
    expiresAt: data.expires_at,
  });
}
