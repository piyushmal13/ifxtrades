import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { logAdminAction } from "@/lib/admin/audit";
import { courseLessonCreateSchema } from "@/lib/validation/admin";

export async function GET() {
  const guard = await requireAdminApi();
  if (guard.error) return guard.error;

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("course_lessons")
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

  const payload = courseLessonCreateSchema.safeParse(await request.json());
  if (!payload.success) {
    return NextResponse.json(
      { error: payload.error.issues[0]?.message ?? "Invalid request body." },
      { status: 400 },
    );
  }

  const input = payload.data;
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("course_lessons")
    .insert({
      course_id: input.course_id,
      title: input.title,
      sort_order: input.sort_order,
      duration_minutes: input.duration_minutes ?? null,
      video_url: input.video_url ?? null,
      pdf_url: input.pdf_url ?? null,
      is_free: input.is_free,
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
      entity: "course_lessons",
      entityId: data.id,
      payload: input,
    });
  }

  return NextResponse.json({ item: data });
}

