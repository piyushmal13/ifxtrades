import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { logAdminAction } from "@/lib/admin/audit";
import { algoUpdateSchema } from "@/lib/validation/admin";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const guard = await requireAdminApi();
  if (guard.error) return guard.error;

  const { id } = await params;
  const payload = algoUpdateSchema.safeParse(await request.json());
  if (!payload.success) {
    return NextResponse.json(
      { error: payload.error.issues[0]?.message ?? "Invalid request body." },
      { status: 400 },
    );
  }

  const input = payload.data;
  const update: Record<string, unknown> = {};
  if ("name" in input) update.name = input.name;
  if ("slug" in input) update.slug = input.slug;
  if ("description" in input) update.description = input.description;
  if ("risk_classification" in input) {
    update.risk_classification = input.risk_classification;
  }
  if ("monthly_roi_pct" in input) update.monthly_roi_pct = input.monthly_roi_pct;
  if ("min_capital" in input) update.min_capital = input.min_capital;
  if ("price" in input) update.price = input.price;
  if ("compliance_disclaimer" in input) {
    update.compliance_disclaimer = input.compliance_disclaimer;
  }
  if ("image_url" in input) update.image_url = input.image_url ?? null;
  if ("is_active" in input) update.is_active = input.is_active;

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("algorithms")
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
      entity: "algorithms",
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
    .from("algorithms")
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
      entity: "algorithms",
      entityId: data.id,
    });
  }

  return NextResponse.json({ ok: true, id });
}

