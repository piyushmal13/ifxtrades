import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { logAdminAction } from "@/lib/admin/audit";
import { webinarSponsorUpdateSchema } from "@/lib/validation/admin";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const guard = await requireAdminApi();
  if (guard.error) return guard.error;

  const { id } = await params;
  const payload = webinarSponsorUpdateSchema.safeParse(await request.json());
  if (!payload.success) {
    return NextResponse.json(
      { error: payload.error.issues[0]?.message ?? "Invalid request body." },
      { status: 400 },
    );
  }

  const input = payload.data;
  const update: Record<string, unknown> = {};
  if ("webinar_id" in input) update.webinar_id = input.webinar_id;
  if ("tier" in input) update.tier = input.tier;
  if ("name" in input) update.name = input.name;
  if ("logo_url" in input) update.logo_url = input.logo_url ?? null;
  if ("link_url" in input) update.link_url = input.link_url ?? null;

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("webinar_sponsors")
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
      entity: "webinar_sponsors",
      entityId: data.id,
      payload: update,
    });
  }

  const { data: hydrated } = await admin
    .from("webinar_sponsors")
    .select("*, webinars(title)")
    .eq("id", data.id)
    .single();

  return NextResponse.json({
    item: {
      ...(hydrated ?? data),
      webinar_title: (hydrated as any)?.webinars?.title ?? data.webinar_id,
    },
  });
}

export async function DELETE(_request: Request, { params }: Params) {
  const guard = await requireAdminApi();
  if (guard.error) return guard.error;

  const { id } = await params;
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("webinar_sponsors")
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
      entity: "webinar_sponsors",
      entityId: data.id,
    });
  }

  return NextResponse.json({ ok: true, id });
}
