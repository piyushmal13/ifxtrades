import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  resolveUserRole,
  resolveUserRoleById,
  type PlatformRole,
} from "@/lib/auth-shared";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type ServerAuthContext = {
  supabase: SupabaseClient;
  user: User | null;
  role: PlatformRole;
};

async function resolveServerRole(
  authClient: SupabaseClient,
  user: User,
): Promise<PlatformRole> {
  const resolvedRole = await resolveUserRole(authClient, user);
  if (resolvedRole === "admin") {
    return "admin";
  }

  // Fallback for environments where profile reads are RLS-restricted for auth users.
  try {
    const adminClient = createSupabaseAdminClient();
    const elevatedRole = await resolveUserRoleById(adminClient, user.id);
    if (elevatedRole === "admin") {
      return "admin";
    }
  } catch {
    // Ignore when service-role env is unavailable.
  }

  return resolvedRole;
}

export async function getServerAuthContext(): Promise<ServerAuthContext> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const role = user ? await resolveServerRole(supabase, user) : "user";
  return { supabase, user, role };
}

export async function requireUser(redirectTo = "/dashboard") {
  const auth = await getServerAuthContext();
  if (!auth.user) {
    redirect(`/login?redirect=${encodeURIComponent(redirectTo)}`);
  }
  return auth;
}

/** Require that the user is logged in AND has verified their email. */
export async function requireVerified(redirectTo = "/dashboard") {
  const auth = await requireUser(redirectTo);
  const { data: profile } = await auth.supabase
    .from("profiles")
    .select("email_verified")
    .eq("id", auth.user!.id)
    .maybeSingle();

  if (!profile?.email_verified) {
    redirect(`/verify?redirect=${encodeURIComponent(redirectTo)}`);
  }
  return auth;
}

/** API variant — returns 403 instead of redirect */
export async function requireVerifiedApi() {
  const auth = await getServerAuthContext();
  if (!auth.user) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      auth: null,
    };
  }

  const { data: profile } = await auth.supabase
    .from("profiles")
    .select("email_verified")
    .eq("id", auth.user.id)
    .maybeSingle();

  if (!profile?.email_verified) {
    return {
      error: NextResponse.json(
        { error: "Email not verified.", code: "EMAIL_NOT_VERIFIED" },
        { status: 403 },
      ),
      auth: null,
    };
  }

  return { error: null, auth };
}

export async function requireAdmin(redirectTo = "/dashboard") {
  // NOTE: pass redirectTo (not "/admin") to requireUser so unauthenticated
  // users get sent to login, not into an infinite /admin redirect loop.
  const auth = await requireUser(redirectTo);
  if (auth.role !== "admin") {
    redirect(redirectTo);
  }
  return auth;
}

export async function requireModerator(redirectTo = "/dashboard") {
  const auth = await requireUser(redirectTo);
  if (auth.role !== "admin" && auth.role !== "moderator") {
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
