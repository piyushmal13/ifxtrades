import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { logAdminAction } from "@/lib/admin/audit";
import { algoCreateSchema } from "@/lib/validation/admin";

export async function GET() {
  const guard = await requireAdminApi();
  if (guard.error) return guard.error;

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("algorithms")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ items: data ?? [] });
}

export async function POST(request: Request) {
  const guard = await requireAdminApi();
  if (guard.error) return guard.error;

  const payload = algoCreateSchema.safeParse(await request.json());
  if (!payload.success) {
    return NextResponse.json(
      { error: payload.error.issues[0]?.message ?? "Invalid request body." },
      { status: 400 },
    );
  }

  const admin = createSupabaseAdminClient();
  const input = payload.data;
  const { data, error } = await admin
    .from("algorithms")
    .insert({
      name: input.name,
      slug: input.slug,
      description: input.description,
      risk_classification: input.risk_classification,
      monthly_roi_pct: input.monthly_roi_pct,
      min_capital: input.min_capital,
      price: input.price,
      compliance_disclaimer: input.compliance_disclaimer,
      image_url: input.image_url ?? null,
      is_active: input.is_active,
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
      entity: "algorithms",
      entityId: data.id,
      payload: input,
    });
  }

  return NextResponse.json({ item: data });
}
