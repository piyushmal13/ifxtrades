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
import { webinarSponsorUpdateSchema } from "@/lib/validation/admin";

export async function PATCH(request: Request, { params }: RouteParams) {
  const resolved = await resolveAdminContext();
  if ("error" in resolved) return resolved.error;

  const id = await getRouteId(params);
  const parsed = await parseJsonBody(request, webinarSponsorUpdateSchema);
  if ("error" in parsed) return parsed.error;

  const input = parsed.data as Record<string, unknown>;
  const update: Record<string, unknown> = {};
  assignIfPresent(update, input, "webinar_id");
  assignIfPresent(update, input, "tier");
  assignIfPresent(update, input, "name");
  assignIfPresent(update, input, "logo_url", { nullIfNil: true });
  assignIfPresent(update, input, "link_url", { nullIfNil: true });

  const { admin } = resolved.context;
  const { data, error } = await admin
    .from("webinar_sponsors")
    .update(update)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return fromSupabaseError(error);
  }

  await logMutation(resolved.context, {
    action: "update",
    entity: "webinar_sponsors",
    entityId: data?.id,
    payload: update,
  });

  const item =
    (await fetchByIdWithWebinarTitle(
      admin,
      "webinar_sponsors",
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
    .from("webinar_sponsors")
    .delete()
    .eq("id", id)
    .select("id")
    .single();

  if (error) {
    return fromSupabaseError(error);
  }

  await logMutation(resolved.context, {
    action: "delete",
    entity: "webinar_sponsors",
    entityId: data?.id,
  });

  return jsonDeleteOk(id);
}
