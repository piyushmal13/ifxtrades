import {
  assignIfPresent,
  fetchByIdWithWebinarTitle,
  fromSupabaseError,
  getRouteId,
  jsonDeleteOk,
  jsonItem,
  logMutation,
  parseJsonBody,
  resolveAdminContext,
  type RouteParams,
} from "@/lib/admin/api";
import { webinarFaqUpdateSchema } from "@/lib/validation/admin";

export async function PATCH(request: Request, { params }: RouteParams) {
  const resolved = await resolveAdminContext();
  if ("error" in resolved) return resolved.error;

  const id = await getRouteId(params);
  const parsed = await parseJsonBody(request, webinarFaqUpdateSchema);
  if ("error" in parsed) return parsed.error;

  const input = parsed.data as Record<string, unknown>;
  const update: Record<string, unknown> = {};
  assignIfPresent(update, input, "webinar_id");
  assignIfPresent(update, input, "question");
  assignIfPresent(update, input, "answer");
  assignIfPresent(update, input, "sort_order");

  const { admin } = resolved.context;
  const { data, error } = await admin
    .from("webinar_faqs")
    .update(update)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return fromSupabaseError(error);
  }

  await logMutation(resolved.context, {
    action: "update",
    entity: "webinar_faqs",
    entityId: data?.id,
    payload: update,
  });

  const item =
    (await fetchByIdWithWebinarTitle(
      admin,
      "webinar_faqs",
      String(data?.id ?? id),
      (data as any)?.webinar_id ?? null,
    )) ?? data;

  return jsonItem(item);
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const resolved = await resolveAdminContext();
  if ("error" in resolved) return resolved.error;

  const id = await getRouteId(params);
  const { admin } = resolved.context;
  const { data, error } = await admin
    .from("webinar_faqs")
    .delete()
    .eq("id", id)
    .select("id")
    .single();

  if (error) {
    return fromSupabaseError(error);
  }

  await logMutation(resolved.context, {
    action: "delete",
    entity: "webinar_faqs",
    entityId: data?.id,
  });

  return jsonDeleteOk(id);
}
