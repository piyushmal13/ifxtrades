import {
  assignIfPresent,
  fromSupabaseError,
  getRouteId,
  jsonDeleteOk,
  jsonItem,
  logMutation,
  parseJsonBody,
  resolveAdminContext,
  type RouteParams,
} from "@/lib/admin/api";
import { blogUpdateSchema } from "@/lib/validation/admin";

export async function PATCH(request: Request, { params }: RouteParams) {
  const resolved = await resolveAdminContext();
  if ("error" in resolved) return resolved.error;

  const id = await getRouteId(params);
  const parsed = await parseJsonBody(request, blogUpdateSchema);
  if ("error" in parsed) return parsed.error;

  const input = parsed.data as Record<string, unknown>;
  const update: Record<string, unknown> = {};
  assignIfPresent(update, input, "title");
  assignIfPresent(update, input, "slug");
  assignIfPresent(update, input, "excerpt");
  assignIfPresent(update, input, "body");
  assignIfPresent(update, input, "category");
  assignIfPresent(update, input, "meta_title", { nullIfNil: true });
  assignIfPresent(update, input, "meta_description", { nullIfNil: true });
  assignIfPresent(update, input, "published_at", {
    nullIfNil: true,
    map: (value) => (value ? new Date(String(value)).toISOString() : null),
  });

  const { admin } = resolved.context;
  const { data, error } = await admin
    .from("blog_posts")
    .update(update)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return fromSupabaseError(error);
  }

  await logMutation(resolved.context, {
    action: "update",
    entity: "blog_posts",
    entityId: data?.id,
    payload: update,
  });

  return jsonItem(data);
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const resolved = await resolveAdminContext();
  if ("error" in resolved) return resolved.error;

  const id = await getRouteId(params);
  const { admin } = resolved.context;
  const { data, error } = await admin
    .from("blog_posts")
    .delete()
    .eq("id", id)
    .select("id")
    .single();

  if (error) {
    return fromSupabaseError(error);
  }

  await logMutation(resolved.context, {
    action: "delete",
    entity: "blog_posts",
    entityId: data?.id,
  });

  return jsonDeleteOk(id);
}
