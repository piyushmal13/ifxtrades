import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { resolveUserRole } from "@/lib/auth-shared";

export async function getServerAuthContext() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const role = user ? await resolveUserRole(supabase, user) : "user";
  return { supabase, user, role };
}

export async function requireUser(redirectTo = "/dashboard") {
  const auth = await getServerAuthContext();
  if (!auth.user) {
    redirect(`/login?redirect=${encodeURIComponent(redirectTo)}`);
  }
  return auth;
}

export async function requireAdmin(redirectTo = "/dashboard") {
  const auth = await requireUser("/admin");
  if (auth.role !== "admin") {
    redirect(redirectTo);
  }
  return auth;
}

export async function requireAdminApi() {
  const auth = await getServerAuthContext();

  if (!auth.user) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      auth: null,
    };
  }

  if (auth.role !== "admin") {
    return {
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
      auth: null,
    };
  }

  return { error: null, auth };
}
