import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { logAdminAction } from "@/lib/admin/audit";
import { algoSnapshotCreateSchema } from "@/lib/validation/admin";

export async function GET() {
  const guard = await requireAdminApi();
  if (guard.error) return guard.error;

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("algo_performance_snapshots")
    .select("*")
    .order("period_start", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ items: data ?? [] });
}

export async function POST(request: Request) {
  const guard = await requireAdminApi();
  if (guard.error) return guard.error;

  const payload = algoSnapshotCreateSchema.safeParse(await request.json());
  if (!payload.success) {
    return NextResponse.json(
      { error: payload.error.issues[0]?.message ?? "Invalid request body." },
      { status: 400 },
    );
  }

  const input = payload.data;
  const admin = createSupabaseAdminClient();
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
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (guard.auth?.user?.id && data?.id) {
    await logAdminAction(admin, {
      actorId: guard.auth.user.id,
      action: "create",
      entity: "algo_performance_snapshots",
      entityId: data.id,
      payload: input,
    });
  }

  return NextResponse.json({ item: data });
}

