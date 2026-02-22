import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function PATCH(request: Request) {
  const guard = await requireAdminApi();
  if (guard.error) return guard.error;

  const payload = await request.json();
  if (!payload?.userId || !payload?.role) {
    return NextResponse.json({ error: "userId and role are required." }, { status: 400 });
  }

  const role = String(payload.role).toUpperCase();
  if (!["USER", "ADMIN"].includes(role)) {
    return NextResponse.json({ error: "Invalid role." }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("profiles")
    .update({ role })
    .eq("id", payload.userId)
    .select("id,email,role")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ item: data });
}
