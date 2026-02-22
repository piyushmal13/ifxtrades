import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { logAdminAction } from "@/lib/admin/audit";
import { blogUpdateSchema } from "@/lib/validation/admin";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const guard = await requireAdminApi();
  if (guard.error) return guard.error;

  const { id } = await params;
  const payload = blogUpdateSchema.safeParse(await request.json());
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
  if ("excerpt" in input) update.excerpt = input.excerpt;
  if ("body" in input) update.body = input.body;
  if ("category" in input) update.category = input.category;
  if ("meta_title" in input) update.meta_title = input.meta_title ?? null;
  if ("meta_description" in input) {
    update.meta_description = input.meta_description ?? null;
  }
  if ("published_at" in input) {
    update.published_at = input.published_at
      ? new Date(input.published_at).toISOString()
      : null;
  }

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("blog_posts")
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
      entity: "blog_posts",
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
    .from("blog_posts")
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
      entity: "blog_posts",
      entityId: data.id,
    });
  }

  return NextResponse.json({ ok: true, id });
}

