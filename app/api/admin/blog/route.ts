import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

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

  const payload = await request.json();
  if (!payload?.title || !payload?.slug || !payload?.body) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();

  const { data, error } = await admin
    .from("blog_posts")
    .insert({
      title: payload.title,
      slug: payload.slug,
      excerpt: payload.excerpt ?? "",
      body: payload.body,
      category: payload.category ?? "Macro",
      meta_title: payload.meta_title ?? payload.title,
      meta_description: payload.meta_description ?? payload.excerpt ?? "",
      published_at: payload.published_at ? new Date(payload.published_at).toISOString() : null,
      author_id: null,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ item: data });
}
