import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const guard = await requireAdminApi();
  if (guard.error) return guard.error;

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.from("reviews").select("*").order("created_at", { ascending: false });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ items: data ?? [] });
}

export async function POST(request: Request) {
  const guard = await requireAdminApi();
  if (guard.error) return guard.error;

  const payload = await request.json();
  if (!payload?.company_name || !payload?.quote) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("reviews")
    .insert({
      company_name: payload.company_name,
      quote: payload.quote,
      video_url: payload.video_url ?? null,
      broker_endorsement: payload.broker_endorsement ?? null,
      is_featured: Boolean(payload.is_featured),
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ item: data });
}
