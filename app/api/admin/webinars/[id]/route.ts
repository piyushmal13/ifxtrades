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
import { webinarUpdateSchema } from "@/lib/validation/admin";

export async function PATCH(request: Request, { params }: RouteParams) {
  const resolved = await resolveAdminContext();
  if ("error" in resolved) return resolved.error;

  const id = await getRouteId(params);
  const parsed = await parseJsonBody(request, webinarUpdateSchema);
  if ("error" in parsed) return parsed.error;

  const input = parsed.data as Record<string, unknown>;
  const update: Record<string, unknown> = {};

  assignIfPresent(update, input, "title");
  assignIfPresent(update, input, "slug");
  assignIfPresent(update, input, "description");
  assignIfPresent(update, input, "venue");
  assignIfPresent(update, input, "sponsor_tier");
  assignIfPresent(update, input, "hotel_sponsor", { nullIfNil: true });
  assignIfPresent(update, input, "capacity");
  assignIfPresent(update, input, "price");
  assignIfPresent(update, input, "registration_deadline", {
    nullIfNil: true,
    map: (value) => (value ? new Date(String(value)).toISOString() : null),
  });
  assignIfPresent(update, input, "starts_at", {
    nullIfNil: true,
    map: (value) => (value ? new Date(String(value)).toISOString() : null),
  });
  assignIfPresent(update, input, "hero_image_url", { nullIfNil: true });
  assignIfPresent(update, input, "promo_video_url", { nullIfNil: true });
  assignIfPresent(update, input, "is_premium");
  assignIfPresent(update, input, "is_published");

  const { admin } = resolved.context;
  const { data, error } = await admin
    .from("webinars")
    .update(update)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return fromSupabaseError(error);
  }

  await logMutation(resolved.context, {
    action: "update",
    entity: "webinars",
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
    .from("webinars")
    .delete()
    .eq("id", id)
    .select("id")
    .single();

  if (error) {
    return fromSupabaseError(error);
  }

  await logMutation(resolved.context, {
    action: "delete",
    entity: "webinars",
    entityId: data?.id,
  });

  return jsonDeleteOk(id);
}
