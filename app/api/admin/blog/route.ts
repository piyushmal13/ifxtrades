import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { logAdminAction } from "@/lib/admin/audit";
import { blogCreateSchema } from "@/lib/validation/admin";

export async function GET() {
  const guard = await requireAdminApi();
  if (guard.error) return guard.error;

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("blog_posts")
    .select("*")
    .order("published_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ items: data ?? [] });
}

export async function POST(request: Request) {
  const guard = await requireAdminApi();
  if (guard.error) return guard.error;

  const payload = blogCreateSchema.safeParse(await request.json());
  if (!payload.success) {
    return NextResponse.json(
      { error: payload.error.issues[0]?.message ?? "Invalid request body." },
      { status: 400 },
    );
  }

  const admin = createSupabaseAdminClient();
  const input = payload.data;

  const { data, error } = await admin
    .from("blog_posts")
    .insert({
      title: input.title,
      slug: input.slug,
      excerpt: input.excerpt ?? "",
      body: input.body,
      category: input.category ?? "Macro",
      meta_title: input.meta_title ?? input.title,
      meta_description: input.meta_description ?? input.excerpt ?? "",
      published_at: input.published_at ? new Date(input.published_at).toISOString() : null,
      author_id: guard.auth?.user.id ?? null,
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
      entity: "blog_posts",
      entityId: data.id,
      payload: input,
    });
  }

  return NextResponse.json({ item: data });
}
