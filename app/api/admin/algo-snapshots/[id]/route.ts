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
import { algoSnapshotUpdateSchema } from "@/lib/validation/admin";

export async function PATCH(request: Request, { params }: RouteParams) {
  const resolved = await resolveAdminContext();
  if ("error" in resolved) return resolved.error;

  const id = await getRouteId(params);
  const parsed = await parseJsonBody(request, algoSnapshotUpdateSchema);
  if ("error" in parsed) return parsed.error;

  const input = parsed.data as Record<string, unknown>;
  const update: Record<string, unknown> = {};
  assignIfPresent(update, input, "algo_id");
  assignIfPresent(update, input, "period_start", {
    nullIfNil: true,
    map: (value) => (value ? new Date(String(value)).toISOString() : null),
  });
  assignIfPresent(update, input, "period_end", {
    nullIfNil: true,
    map: (value) => (value ? new Date(String(value)).toISOString() : null),
  });
  assignIfPresent(update, input, "roi_pct");
  assignIfPresent(update, input, "drawdown_pct");

  const { admin } = resolved.context;
  const { data, error } = await admin
    .from("algo_performance_snapshots")
    .update(update)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return fromSupabaseError(error);
  }

  await logMutation(resolved.context, {
    action: "update",
    entity: "algo_performance_snapshots",
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
    .from("algo_performance_snapshots")
    .delete()
    .eq("id", id)
    .select("id")
    .single();

  if (error) {
    return fromSupabaseError(error);
  }

  await logMutation(resolved.context, {
    action: "delete",
    entity: "algo_performance_snapshots",
    entityId: data?.id,
  });

  return jsonDeleteOk(id);
}
