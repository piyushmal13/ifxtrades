import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import {
  resolveUserRole,
  resolveUserRoleById,
  type PlatformRole,
} from "@/lib/auth-shared";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

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

  // Fallback when profile reads are RLS-restricted for auth users.
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

async function markProfileVerifiedBestEffort(auth: ServerAuthContext) {
  if (!auth.user) return;

  try {
    await auth.supabase
      .from("profiles")
      .update({ email_verified: true })
      .eq("id", auth.user.id)
      .eq("email_verified", false);
  } catch {
    // Ignore profile sync failures. Auth user state remains source-of-truth.
  }
}

async function isEmailVerified(auth: ServerAuthContext): Promise<boolean> {
  const user = auth.user;
  if (!user) return false;

  // Supabase auth user confirmation is the primary source-of-truth.
  if (Boolean(user.email_confirmed_at)) {
    await markProfileVerifiedBestEffort(auth);
    return true;
  }

  // Backward compatibility for legacy OTP/profile flows.
  const { data: profile } = await auth.supabase
    .from("profiles")
    .select("email_verified")
    .eq("id", user.id)
    .maybeSingle();

  return Boolean(profile?.email_verified);
}

export async function requireVerified(redirectTo = "/dashboard") {
  const auth = await requireUser(redirectTo);
  if (!(await isEmailVerified(auth))) {
    redirect(`/verify?redirect=${encodeURIComponent(redirectTo)}`);
  }
  return auth;
}

export async function requireVerifiedApi() {
  const auth = await getServerAuthContext();
  if (!auth.user) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      auth: null,
    };
  }

  if (!(await isEmailVerified(auth))) {
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
  // Pass redirectTo (not "/admin") so unauthenticated users go to login,
  // not an /admin redirect loop.
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
