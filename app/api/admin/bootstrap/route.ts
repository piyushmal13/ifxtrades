import { NextResponse } from "next/server";
import { getServerAuthContext } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const COLUMN_MISSING_PATTERN = /column|schema cache|does not exist/i;

function parseEmailAllowlist(raw: string | undefined) {
  return new Set(
    (raw ?? "")
      .split(",")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean),
  );
}

async function countAdmins(admin: ReturnType<typeof createSupabaseAdminClient>) {
  const queries = [
    () =>
      admin
        .from("profiles")
        .select("id", { head: true, count: "exact" })
        .in("role", [
          "admin",
          "ADMIN",
          "administrator",
          "superadmin",
          "super_admin",
          "owner",
          "root",
        ]),
    () =>
      admin
        .from("profiles")
        .select("id", { head: true, count: "exact" })
        .in("user_role", [
          "admin",
          "ADMIN",
          "administrator",
          "superadmin",
          "super_admin",
          "owner",
          "root",
        ]),
    () =>
      admin
        .from("profiles")
        .select("id", { head: true, count: "exact" })
        .eq("is_admin", true),
  ];

  for (const runQuery of queries) {
    const { count, error } = await runQuery();
    if (!error) {
      return { ok: true as const, count: count ?? 0 };
    }
    if (!COLUMN_MISSING_PATTERN.test(error.message)) {
      return { ok: false as const, error: error.message };
    }
  }

  return { ok: false as const, error: "Unable to inspect current admin users." };
}

async function grantAdminRole(
  admin: ReturnType<typeof createSupabaseAdminClient>,
  userId: string,
) {
  const attempts: Array<{
    mode: "update" | "upsert";
    payload: Record<string, unknown>;
  }> = [
    { mode: "update", payload: { role: "admin" } },
    { mode: "update", payload: { user_role: "admin" } },
    { mode: "update", payload: { is_admin: true } },
    { mode: "upsert", payload: { id: userId, role: "admin" } },
    { mode: "upsert", payload: { id: userId, user_role: "admin" } },
    { mode: "upsert", payload: { id: userId, is_admin: true } },
  ];

  let lastError: string | null = null;

  for (const attempt of attempts) {
    const query =
      attempt.mode === "update"
        ? admin
            .from("profiles")
            .update(attempt.payload)
            .eq("id", userId)
        : admin.from("profiles").upsert(attempt.payload, { onConflict: "id" });

    const { error } = await query;
    if (!error) {
      return { ok: true as const };
    }

    lastError = error.message;
    if (!COLUMN_MISSING_PATTERN.test(error.message)) {
      continue;
    }
  }

  return {
    ok: false as const,
    error: lastError ?? "Unable to write an admin role to profiles.",
  };
}

export async function POST(request: Request) {
  const auth = await getServerAuthContext();
  if (!auth.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (auth.role === "admin") {
    return NextResponse.json({
      ok: true,
      alreadyAdmin: true,
      message: "Current user already has admin access.",
    });
  }

  const body = await request.json().catch(() => ({}));
  const token =
    typeof body?.token === "string" ? body.token.trim() : "";

  const configuredToken = process.env.IFX_ADMIN_BOOTSTRAP_TOKEN?.trim() ?? "";
  const allowlistedEmails = parseEmailAllowlist(
    process.env.IFX_ADMIN_BOOTSTRAP_EMAILS,
  );
  const requestorEmail = auth.user.email?.toLowerCase() ?? "";
  const isAllowlisted = requestorEmail
    ? allowlistedEmails.has(requestorEmail)
    : false;
  const hasValidToken = configuredToken ? token === configuredToken : false;
  const allowDevBootstrap =
    process.env.NODE_ENV !== "production" &&
    !configuredToken &&
    allowlistedEmails.size === 0;

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
  const adminCount = await countAdmins(admin);
  if (!adminCount.ok) {
    return NextResponse.json({ error: adminCount.error }, { status: 500 });
  }

  const noAdminsExist = adminCount.count === 0;
  if (!noAdminsExist && !isAllowlisted && !hasValidToken && !allowDevBootstrap) {
    return NextResponse.json(
      {
        error:
          "Bootstrap denied. Use IFX_ADMIN_BOOTSTRAP_TOKEN, IFX_ADMIN_BOOTSTRAP_EMAILS, or remove existing admins first.",
      },
      { status: 403 },
    );
  }

  const promoted = await grantAdminRole(admin, auth.user.id);
  if (!promoted.ok) {
    return NextResponse.json({ error: promoted.error }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    role: "admin",
    userId: auth.user.id,
    message: "Admin access granted. Refresh the app to continue.",
  });
}
