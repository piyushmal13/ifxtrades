import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { logAdminAction } from "@/lib/admin/audit";
import { webinarSponsorCreateSchema } from "@/lib/validation/admin";

export async function GET() {
  const guard = await requireAdminApi();
  if (guard.error) return guard.error;

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("webinar_sponsors")
    .select("*, webinars(title)")
    .order("name", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const items = (data ?? []).map((row: any) => ({
    ...row,
    webinar_title: row.webinars?.title ?? row.webinar_id,
  }));

  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const guard = await requireAdminApi();
  if (guard.error) return guard.error;

  const payload = webinarSponsorCreateSchema.safeParse(await request.json());
  if (!payload.success) {
    return NextResponse.json(
      { error: payload.error.issues[0]?.message ?? "Invalid request body." },
      { status: 400 },
    );
  }

  const input = payload.data;
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("webinar_sponsors")
    .insert({
      webinar_id: input.webinar_id,
      tier: input.tier,
      name: input.name,
      logo_url: input.logo_url ?? null,
      link_url: input.link_url ?? null,
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
      entity: "webinar_sponsors",
      entityId: data.id,
      payload: input,
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
