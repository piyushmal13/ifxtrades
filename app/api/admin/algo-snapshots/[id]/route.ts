import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { logAdminAction } from "@/lib/admin/audit";
import { algoSnapshotUpdateSchema } from "@/lib/validation/admin";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const guard = await requireAdminApi();
  if (guard.error) return guard.error;

  const { id } = await params;
  const payload = algoSnapshotUpdateSchema.safeParse(await request.json());
  if (!payload.success) {
    return NextResponse.json(
      { error: payload.error.issues[0]?.message ?? "Invalid request body." },
      { status: 400 },
    );
  }

  const input = payload.data;
  const update: Record<string, unknown> = {};
  if ("algo_id" in input) update.algo_id = input.algo_id;
  if ("period_start" in input) {
    update.period_start = input.period_start
      ? new Date(input.period_start).toISOString()
      : null;
  }
  if ("period_end" in input) {
    update.period_end = input.period_end
      ? new Date(input.period_end).toISOString()
      : null;
  }
  if ("roi_pct" in input) update.roi_pct = input.roi_pct;
  if ("drawdown_pct" in input) update.drawdown_pct = input.drawdown_pct;

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("algo_performance_snapshots")
    .update(update)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (guard.auth?.user?.id && data?.id) {
    await logAdminAction(admin, {
      actorId: guard.auth.user.id,
      action: "update",
      entity: "algo_performance_snapshots",
      entityId: data.id,
      payload: update,
    });
  }

  return NextResponse.json({ item: data });
}

export async function DELETE(_request: Request, { params }: Params) {
  const guard = await requireAdminApi();
  if (guard.error) return guard.error;

  const { id } = await params;
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("algo_performance_snapshots")
    .delete()
    .eq("id", id)
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (guard.auth?.user?.id && data?.id) {
    await logAdminAction(admin, {
      actorId: guard.auth.user.id,
      action: "delete",
      entity: "algo_performance_snapshots",
      entityId: data.id,
    });
  }

  return NextResponse.json({ ok: true, id });
}

