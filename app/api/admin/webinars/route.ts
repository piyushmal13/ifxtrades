import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const guard = await requireAdminApi();
  if (guard.error) return guard.error;

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.from("webinars").select("*").order("created_at", { ascending: false });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ items: data ?? [] });
}

export async function POST(request: Request) {
  const guard = await requireAdminApi();
  if (guard.error) return guard.error;

  const payload = await request.json();
  if (!payload?.title || !payload?.slug || !payload?.description || !payload?.venue) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("webinars")
    .insert({
      title: payload.title,
      slug: payload.slug,
      description: payload.description,
      venue: payload.venue,
      capacity: Number(payload.capacity ?? 100),
      price: Number(payload.price ?? 0),
      registration_deadline: payload.registration_deadline ?? new Date().toISOString(),
      is_premium: Boolean(payload.is_premium),
      is_published: Boolean(payload.is_published),
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ item: data });
}
