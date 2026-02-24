import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { User } from "@supabase/supabase-js";

async function emailExists(email: string) {
    const supabase = createSupabaseAdminClient();

    // Fast path: profile lookup (if email column exists in this project).
    try {
        const { data: profile } = await supabase
            .from("profiles")
            .select("id")
            .ilike("email", email)
            .limit(1)
            .maybeSingle();
        if (profile?.id) {
            return true;
        }
    } catch {
        // Continue with auth listing fallback.
    }

    const perPage = 1000;
    for (let page = 1; page <= 10; page += 1) {
        const { data: listData, error } = await supabase.auth.admin.listUsers({
            page,
            perPage,
        });
        if (error) break;
        const users = listData?.users ?? [];
        if (users.some((u: User) => u.email?.toLowerCase() === email)) {
            return true;
        }
        if (users.length < perPage) break;
    }

    return false;
}

/**
 * POST /api/auth/check-email
 * Body: { email: string }
 * Returns: { exists: boolean }
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const email: string = (body?.email ?? "").trim().toLowerCase();

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json({ exists: false });
        }

        const found = await emailExists(email);

        return NextResponse.json({ exists: found }, { status: 200 });
    } catch {
        return NextResponse.json({ exists: false }, { status: 200 });
    }
}
