import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { User } from "@supabase/supabase-js";

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

        const supabase = createSupabaseAdminClient();
        // getUserByEmail doesn't exist; use listUsers with per-page matching
        const { data: listData } = await supabase.auth.admin.listUsers({ perPage: 50000 });
        const found = listData?.users?.find((u: User) => u.email?.toLowerCase() === email);

        return NextResponse.json({ exists: Boolean(found) }, { status: 200 });
    } catch {
        return NextResponse.json({ exists: false }, { status: 200 });
    }
}
