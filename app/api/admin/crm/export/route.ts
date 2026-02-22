import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

function asCsv(headers: string[], rows: Record<string, any>[]) {
  const escape = (value: any) => `"${String(value ?? "").replace(/"/g, '""')}"`;
  const head = headers.join(",");
  const body = rows.map((row) => headers.map((header) => escape(row[header])).join(",")).join("\n");
  return `${head}\n${body}`;
}

export async function GET(request: Request) {
  const guard = await requireAdminApi();
  if (guard.error) return guard.error;

  const admin = createSupabaseAdminClient();
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

  const { data, error } = await admin.from("profiles").select("id,email,role,created_at");
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const csv = asCsv(["id", "email", "role", "created_at"], data ?? []);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="users.csv"',
    },
  });
}
