import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { logAdminAction } from "@/lib/admin/audit";
import { webinarAgendaCreateSchema } from "@/lib/validation/admin";

export async function GET() {
  const guard = await requireAdminApi();
  if (guard.error) return guard.error;

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("webinar_agenda_items")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ items: data ?? [] });
}

export async function POST(request: Request) {
  const guard = await requireAdminApi();
  if (guard.error) return guard.error;

  const payload = webinarAgendaCreateSchema.safeParse(await request.json());
  if (!payload.success) {
    return NextResponse.json(
      { error: payload.error.issues[0]?.message ?? "Invalid request body." },
      { status: 400 },
    );
  }

  const input = payload.data;
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("webinar_agenda_items")
    .insert({
      webinar_id: input.webinar_id,
      time: input.time ? new Date(input.time).toISOString() : null,
      topic: input.topic,
      speaker_name: input.speaker_name,
      speaker_linkedin: input.speaker_linkedin ?? null,
      speaker_image_url: input.speaker_image_url ?? null,
      sort_order: input.sort_order,
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
      entity: "webinar_agenda_items",
      entityId: data.id,
      payload: input,
    });
  }

  return NextResponse.json({ item: data });
}

