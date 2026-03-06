import {
  fromSupabaseError,
  jsonItem,
  jsonItems,
  logMutation,
  parseJsonBody,
  resolveAdminContext,
} from "@/lib/admin/api";
import { blogCreateSchema } from "@/lib/validation/admin";

export async function GET() {
  const resolved = await resolveAdminContext();
  if ("error" in resolved) return resolved.error;

  const { admin } = resolved.context;
  const { data, error } = await admin
    .from("blog_posts")
    .select("*")
    .order("published_at", { ascending: false });

  if (error) {
    return fromSupabaseError(error);
  }

  return jsonItems(data ?? []);
}

export async function POST(request: Request) {
  const resolved = await resolveAdminContext();
  if ("error" in resolved) return resolved.error;

  const parsed = await parseJsonBody(request, blogCreateSchema);
  if ("error" in parsed) return parsed.error;

  const { admin } = resolved.context;
  const input = parsed.data;

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
      author_id: resolved.context.actorId,
    })
    .select("*")
    .single();

  if (error) {
    return fromSupabaseError(error);
  }

  await logMutation(resolved.context, {
    action: "create",
    entity: "blog_posts",
    entityId: data?.id,
    payload: input,
  });

  return jsonItem(data);
}
