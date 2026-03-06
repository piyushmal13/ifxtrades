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
import { algoUpdateSchema } from "@/lib/validation/admin";

export async function PATCH(request: Request, { params }: RouteParams) {
  const resolved = await resolveAdminContext();
  if ("error" in resolved) return resolved.error;

  const id = await getRouteId(params);
  const parsed = await parseJsonBody(request, algoUpdateSchema);
  if ("error" in parsed) return parsed.error;

  const input = parsed.data as Record<string, unknown>;
  const update: Record<string, unknown> = {};
  assignIfPresent(update, input, "name");
  assignIfPresent(update, input, "slug");
  assignIfPresent(update, input, "description");
  assignIfPresent(update, input, "risk_classification");
  assignIfPresent(update, input, "monthly_roi_pct");
  assignIfPresent(update, input, "min_capital");
  assignIfPresent(update, input, "price");
  assignIfPresent(update, input, "compliance_disclaimer");
  assignIfPresent(update, input, "image_url", { nullIfNil: true });
  assignIfPresent(update, input, "is_active");

  const { admin } = resolved.context;
  const { data, error } = await admin
    .from("algorithms")
    .update(update)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return fromSupabaseError(error);
  }

  await logMutation(resolved.context, {
    action: "update",
    entity: "algorithms",
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
    .from("algorithms")
    .delete()
    .eq("id", id)
    .select("id")
    .single();

  if (error) {
    return fromSupabaseError(error);
  }

  await logMutation(resolved.context, {
    action: "delete",
    entity: "algorithms",
    entityId: data?.id,
  });

  return jsonDeleteOk(id);
}
