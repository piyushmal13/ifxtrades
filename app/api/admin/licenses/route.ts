import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function PATCH(request: Request) {
  const guard = await requireAdminApi();
  if (guard.error) return guard.error;

  const payload = await request.json();
  if (!payload?.licenseId) {
    return NextResponse.json({ error: "licenseId is required." }, { status: 400 });
  }

  const update: Record<string, any> = {};
  if (payload.expiresAt) {
    update.expires_at = new Date(payload.expiresAt).toISOString();
  }
  if (payload.status) {
    update.status = payload.status;
  }

  if (!Object.keys(update).length) {
    return NextResponse.json({ error: "No update fields supplied." }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("algo_licenses")
    .update(update)
    .eq("id", payload.licenseId)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ item: data });
}
