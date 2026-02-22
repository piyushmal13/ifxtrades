import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { logAdminAction } from "@/lib/admin/audit";
import { webinarAgendaUpdateSchema } from "@/lib/validation/admin";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const guard = await requireAdminApi();
  if (guard.error) return guard.error;

  const { id } = await params;
  const payload = webinarAgendaUpdateSchema.safeParse(await request.json());
  if (!payload.success) {
    return NextResponse.json(
      { error: payload.error.issues[0]?.message ?? "Invalid request body." },
      { status: 400 },
    );
  }

  const input = payload.data;
  const update: Record<string, unknown> = {};
  if ("webinar_id" in input) update.webinar_id = input.webinar_id;
  if ("time" in input) {
    update.time = input.time ? new Date(input.time).toISOString() : null;
  }
  if ("topic" in input) update.topic = input.topic;
  if ("speaker_name" in input) update.speaker_name = input.speaker_name;
  if ("speaker_linkedin" in input) {
    update.speaker_linkedin = input.speaker_linkedin ?? null;
  }
  if ("speaker_image_url" in input) {
    update.speaker_image_url = input.speaker_image_url ?? null;
  }
  if ("sort_order" in input) update.sort_order = input.sort_order;

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("webinar_agenda_items")
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
      entity: "webinar_agenda_items",
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
    .from("webinar_agenda_items")
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
      entity: "webinar_agenda_items",
      entityId: data.id,
    });
  }

  return NextResponse.json({ ok: true, id });
}

