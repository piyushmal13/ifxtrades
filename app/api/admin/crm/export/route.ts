import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { normalizeRole } from "@/lib/auth-shared";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

function asCsv(headers: string[], rows: Record<string, any>[]) {
  const escape = (value: any) => `"${String(value ?? "").replace(/"/g, '""')}"`;
  const head = headers.join(",");
  const body = rows.map((row) => headers.map((header) => escape(row[header])).join(",")).join("\n");
  return `${head}\n${body}`;
}

async function fetchProfileRoles(admin: ReturnType<typeof createSupabaseAdminClient>) {
  const attempts = [
    { select: "id,role", read: (row: Record<string, unknown>) => row.role },
    { select: "id,user_role", read: (row: Record<string, unknown>) => row.user_role },
    { select: "id,is_admin", read: (row: Record<string, unknown>) => row.is_admin },
  ] as const;

  for (const attempt of attempts) {
    const { data, error } = await admin.from("profiles").select(attempt.select);
    if (error) {
      continue;
    }

    const roleByUserId = new Map<string, string>();
    for (const row of data ?? []) {
      const id = typeof row.id === "string" ? row.id : "";
      if (!id) continue;
      roleByUserId.set(id, normalizeRole(attempt.read(row)));
    }
    return roleByUserId;
  }

  return new Map<string, string>();
}

export async function GET(request: Request) {
  const guard = await requireAdminApi();
  if (guard.error) return guard.error;

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
  const { searchParams } = new URL(request.url);
  const type = (searchParams.get("type") || "users").toLowerCase();

  if (type === "licenses") {
    const { data, error } = await admin
      .from("algo_licenses")
      .select("id,user_id,algo_id,status,starts_at,expires_at,purchased_at");
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    const csv = asCsv(
      ["id", "user_id", "algo_id", "status", "starts_at", "expires_at", "purchased_at"],
      data ?? [],
    );
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": 'attachment; filename="licenses.csv"',
      },
    });
  }

  if (type === "payments") {
    const { data, error } = await admin
      .from("payments")
      .select("id,user_id,amount,currency,status,product_type,product_id,created_at");
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    const csv = asCsv(
      ["id", "user_id", "amount", "currency", "status", "product_type", "product_id", "created_at"],
      data ?? [],
    );
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": 'attachment; filename="payments.csv"',
      },
    });
  }

  const [usersResponse, roleByUserId] = await Promise.all([
    admin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
    fetchProfileRoles(admin),
  ]);
  const usersError = usersResponse.error;
  if (usersError) return NextResponse.json({ error: usersError.message }, { status: 400 });

  const rows =
    usersResponse.data?.users?.map((user) => ({
      id: user.id,
      email: user.email ?? "",
      role: roleByUserId.get(user.id) ?? "user",
      created_at: user.created_at ?? "",
    })) ?? [];

  const csv = asCsv(["id", "email", "role", "created_at"], rows);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="users.csv"',
    },
  });
}
