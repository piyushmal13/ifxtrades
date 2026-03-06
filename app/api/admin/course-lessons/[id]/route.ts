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
import { courseLessonUpdateSchema } from "@/lib/validation/admin";

export async function PATCH(request: Request, { params }: RouteParams) {
  const resolved = await resolveAdminContext();
  if ("error" in resolved) return resolved.error;

  const id = await getRouteId(params);
  const parsed = await parseJsonBody(request, courseLessonUpdateSchema);
  if ("error" in parsed) return parsed.error;

  const input = parsed.data as Record<string, unknown>;
  const update: Record<string, unknown> = {};
  assignIfPresent(update, input, "course_id");
  assignIfPresent(update, input, "title");
  assignIfPresent(update, input, "sort_order");
  assignIfPresent(update, input, "duration_minutes", { nullIfNil: true });
  assignIfPresent(update, input, "video_url", { nullIfNil: true });
  assignIfPresent(update, input, "pdf_url", { nullIfNil: true });
  assignIfPresent(update, input, "is_free");

  const { admin } = resolved.context;
  const { data, error } = await admin
    .from("course_lessons")
    .update(update)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return fromSupabaseError(error);
  }

  await logMutation(resolved.context, {
    action: "update",
    entity: "course_lessons",
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
    .from("course_lessons")
    .delete()
    .eq("id", id)
    .select("id")
    .single();

  if (error) {
    return fromSupabaseError(error);
  }

  await logMutation(resolved.context, {
    action: "delete",
    entity: "course_lessons",
    entityId: data?.id,
  });

  return jsonDeleteOk(id);
}
