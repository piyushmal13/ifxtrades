import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { logAdminAction } from "@/lib/admin/audit";
import { webinarCreateSchema } from "@/lib/validation/admin";

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

  const payload = webinarCreateSchema.safeParse(await request.json());
  if (!payload.success) {
    return NextResponse.json(
      { error: payload.error.issues[0]?.message ?? "Invalid request body." },
      { status: 400 },
    );
  }

  const admin = createSupabaseAdminClient();
  const input = payload.data;
  const { data, error } = await admin
    .from("webinars")
    .insert({
      title: input.title,
      slug: input.slug,
      description: input.description,
      venue: input.venue,
      sponsor_tier: input.sponsor_tier ?? "GOLD",
      hotel_sponsor: input.hotel_sponsor ?? null,
      capacity: input.capacity,
      price: input.price,
      registration_deadline: input.registration_deadline
        ? new Date(input.registration_deadline).toISOString()
        : null,
      starts_at: input.starts_at ? new Date(input.starts_at).toISOString() : null,
      hero_image_url: input.hero_image_url ?? null,
      promo_video_url: input.promo_video_url ?? null,
      is_premium: input.is_premium,
      is_published: input.is_published,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (guard.auth?.user?.id && data?.id) {
    await logAdminAction(admin, {
      actorId: guard.auth.user.id,
      action: "create",
      entity: "webinars",
      entityId: data.id,
      payload: input,
    });
  }

  return NextResponse.json({ item: data });
}
