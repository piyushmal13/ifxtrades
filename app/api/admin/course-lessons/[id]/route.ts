import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { logAdminAction } from "@/lib/admin/audit";
import { courseLessonUpdateSchema } from "@/lib/validation/admin";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const guard = await requireAdminApi();
  if (guard.error) return guard.error;

  const { id } = await params;
  const payload = courseLessonUpdateSchema.safeParse(await request.json());
  if (!payload.success) {
    return NextResponse.json(
      { error: payload.error.issues[0]?.message ?? "Invalid request body." },
      { status: 400 },
    );
  }

  const input = payload.data;
  const update: Record<string, unknown> = {};
  if ("course_id" in input) update.course_id = input.course_id;
  if ("title" in input) update.title = input.title;
  if ("sort_order" in input) update.sort_order = input.sort_order;
  if ("duration_minutes" in input) {
    update.duration_minutes = input.duration_minutes ?? null;
  }
  if ("video_url" in input) update.video_url = input.video_url ?? null;
  if ("pdf_url" in input) update.pdf_url = input.pdf_url ?? null;
  if ("is_free" in input) update.is_free = input.is_free;

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("course_lessons")
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
      entity: "course_lessons",
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
    .from("course_lessons")
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
      entity: "course_lessons",
      entityId: data.id,
    });
  }

  return NextResponse.json({ ok: true, id });
}

