import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { logAdminAction } from "@/lib/admin/audit";
import { webinarUpdateSchema } from "@/lib/validation/admin";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const guard = await requireAdminApi();
  if (guard.error) return guard.error;

  const { id } = await params;
  const payload = webinarUpdateSchema.safeParse(await request.json());
  if (!payload.success) {
    return NextResponse.json(
      { error: payload.error.issues[0]?.message ?? "Invalid request body." },
      { status: 400 },
    );
  }

  const input = payload.data;
  const update: Record<string, unknown> = {};

  if ("title" in input) update.title = input.title;
  if ("slug" in input) update.slug = input.slug;
  if ("description" in input) update.description = input.description;
  if ("venue" in input) update.venue = input.venue;
  if ("sponsor_tier" in input) update.sponsor_tier = input.sponsor_tier;
  if ("hotel_sponsor" in input) update.hotel_sponsor = input.hotel_sponsor ?? null;
  if ("capacity" in input) update.capacity = input.capacity;
  if ("price" in input) update.price = input.price;
  if ("registration_deadline" in input) {
    update.registration_deadline = input.registration_deadline
      ? new Date(input.registration_deadline).toISOString()
      : null;
  }
  if ("starts_at" in input) {
    update.starts_at = input.starts_at
      ? new Date(input.starts_at).toISOString()
      : null;
  }
  if ("hero_image_url" in input) update.hero_image_url = input.hero_image_url ?? null;
  if ("promo_video_url" in input) update.promo_video_url = input.promo_video_url ?? null;
  if ("is_premium" in input) update.is_premium = input.is_premium;
  if ("is_published" in input) update.is_published = input.is_published;

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("webinars")
    .update(update)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (guard.auth?.user?.id && data?.id) {
    await logAdminAction(admin, {
      actorId: guard.auth.user.id,
      action: "update",
      entity: "webinars",
      entityId: data.id,
      payload: update,
    });
  }

  return NextResponse.json({ item: data });
}

export async function DELETE(_request: Request, { params }: Params) {
  const guard = await requireAdminApi();
  if (guard.error) return guard.error;

  const { id } = await params;
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("webinars")
    .delete()
    .eq("id", id)
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (guard.auth?.user?.id && data?.id) {
    await logAdminAction(admin, {
      actorId: guard.auth.user.id,
      action: "delete",
      entity: "webinars",
      entityId: data.id,
    });
  }

  return NextResponse.json({ ok: true, id });
}

