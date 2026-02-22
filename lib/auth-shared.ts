import type { SupabaseClient, User } from "@supabase/supabase-js";

export type PlatformRole = "user" | "admin";

export function normalizeRole(raw: string | null | undefined): PlatformRole {
  return raw?.toLowerCase() === "admin" ? "admin" : "user";
}

export async function resolveUserRole(
  supabase: SupabaseClient,
  user: User,
): Promise<PlatformRole> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role) {
    return normalizeRole(profile.role);
  }

  const metadataRole = normalizeRole(
    user.app_metadata?.role ?? user.user_metadata?.role,
  );
  if (metadataRole === "admin") {
    return "admin";
  }

  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL?.toLowerCase();
  if (adminEmail && user.email?.toLowerCase() === adminEmail) {
    return "admin";
  }

  return "user";
}
