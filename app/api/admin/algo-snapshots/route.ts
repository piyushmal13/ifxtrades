import {
  fromSupabaseError,
  jsonItem,
  jsonItems,
  logMutation,
  parseJsonBody,
  resolveAdminContext,
} from "@/lib/admin/api";
import { algoSnapshotCreateSchema } from "@/lib/validation/admin";

export async function GET() {
  const resolved = await resolveAdminContext();
  if ("error" in resolved) return resolved.error;

  const { admin } = resolved.context;
  const { data, error } = await admin
    .from("algo_performance_snapshots")
    .select("*")
    .order("period_start", { ascending: false });

  if (error) {
    return fromSupabaseError(error);
  }

  return jsonItems(data ?? []);
}

export async function POST(request: Request) {
  const resolved = await resolveAdminContext();
  if ("error" in resolved) return resolved.error;

  const parsed = await parseJsonBody(request, algoSnapshotCreateSchema);
  if ("error" in parsed) return parsed.error;

  const input = parsed.data;
  const { admin } = resolved.context;
  const { data, error } = await admin
    .from("algo_performance_snapshots")
    .insert({
      algo_id: input.algo_id,
      period_start: input.period_start
        ? new Date(input.period_start).toISOString()
        : null,
      period_end: input.period_end ? new Date(input.period_end).toISOString() : null,
      roi_pct: input.roi_pct,
      drawdown_pct: input.drawdown_pct,
    })
    .select("*")
    .single();

  if (error) {
    return fromSupabaseError(error);
  }

  await logMutation(resolved.context, {
    action: "create",
    entity: "algo_performance_snapshots",
    entityId: data?.id,
    payload: input,
  });

  return jsonItem(data);
}
