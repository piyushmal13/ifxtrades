import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { normalizeRole } from "@/lib/auth-shared";
import { logAdminAction } from "@/lib/admin/audit";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const COLUMN_MISSING_PATTERN = /column|schema cache|does not exist/i;

async function updateUserRole(
  admin: ReturnType<typeof createSupabaseAdminClient>,
  userId: string,
  role: "user" | "admin",
) {
  const attempts: Array<Record<string, unknown>> = [
    { role },
    { user_role: role },
    { is_admin: role === "admin" },
  ];

  let lastError: string | null = null;

  for (const payload of attempts) {
    const { data, error } = await admin
      .from("profiles")
      .update(payload)
      .eq("id", userId)
      .select("id")
      .maybeSingle();

    if (!error) {
      if (data?.id) {
        return { ok: true as const, role };
      }
      return { ok: false as const, error: "User profile not found." };
    }

    lastError = error.message;
    if (!COLUMN_MISSING_PATTERN.test(error.message)) {
      return { ok: false as const, error: error.message };
    }
  }

  return {
    ok: false as const,
    error: lastError ?? "Unable to update role on profiles table.",
  };
}

export async function PATCH(request: Request) {
  const guard = await requireAdminApi();
  if (guard.error) return guard.error;

  const payload = await request.json().catch(() => ({}));
  if (!payload?.userId || !payload?.role) {
    return NextResponse.json({ error: "userId and role are required." }, { status: 400 });
  }

  const normalized = normalizeRole(payload.role);
  if (normalized !== "user" && normalized !== "admin") {
    return NextResponse.json({ error: "Invalid role." }, { status: 400 });
  }
  const role: "user" | "admin" = normalized;

  let admin: ReturnType<typeof createSupabaseAdminClient>;
  try {
    admin = createSupabaseAdminClient();
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Missing Supabase admin client environment variables.";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const updateResult = await updateUserRole(admin, String(payload.userId), role);
  if (!updateResult.ok) {
    return NextResponse.json({ error: updateResult.error }, { status: 400 });
  }

  if (guard.auth?.user?.id) {
    await logAdminAction(admin, {
      actorId: guard.auth.user.id,
      action: "update",
      entity: "profiles",
      entityId: String(payload.userId),
      payload: { role },
    });
  }

  return NextResponse.json({ item: { id: String(payload.userId), role } });
}
