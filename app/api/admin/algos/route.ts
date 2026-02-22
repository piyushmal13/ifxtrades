import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const guard = await requireAdminApi();
  if (guard.error) return guard.error;

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("algorithms")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ items: data ?? [] });
}

export async function POST(request: Request) {
  const guard = await requireAdminApi();
  if (guard.error) return guard.error;

  const payload = await request.json();
  if (!payload?.name || !payload?.slug || !payload?.description) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("algorithms")
    .insert({
      name: payload.name,
      slug: payload.slug,
      description: payload.description,
      risk_classification: payload.risk_classification ?? "MEDIUM",
      monthly_roi_pct: Number(payload.monthly_roi_pct ?? 0),
      min_capital: Number(payload.min_capital ?? 0),
      price: Number(payload.price ?? 0),
      compliance_disclaimer:
        payload.compliance_disclaimer ??
        "Past performance is not indicative of future results.",
      is_active: payload.is_active !== false,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ item: data });
}
