import type { SupabaseClient, User } from "@supabase/supabase-js";

export type PlatformRole = "user" | "admin" | "moderator" | "support";

const ADMIN_ALIASES = new Set([
  "admin",
  "administrator",
  "superadmin",
  "super_admin",
  "owner",
  "root",
]);

const MODERATOR_ALIASES = new Set(["moderator", "mod"]);
const SUPPORT_ALIASES = new Set(["support", "support_staff"]);


type RoleCandidate = {
  column: string;
  role: PlatformRole;
};

function asCleanString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function normalizeRole(raw: unknown): PlatformRole {
  if (typeof raw === "boolean") {
    return raw ? "admin" : "user";
  }

  const value = asCleanString(raw).toLowerCase();
  if (ADMIN_ALIASES.has(value)) {
    return "admin";
  }
  if (MODERATOR_ALIASES.has(value)) {
    return "moderator";
  }
  if (SUPPORT_ALIASES.has(value)) {
    return "support";
  }
  return "user";
}


function roleCandidatesFromProfile(profile: Record<string, unknown>) {
  const candidates: RoleCandidate[] = [];

  if (typeof profile.role === "string" && profile.role.trim()) {
    candidates.push({ column: "role", role: normalizeRole(profile.role) });
  }
  if (typeof profile.user_role === "string" && profile.user_role.trim()) {
    candidates.push({
      column: "user_role",
      role: normalizeRole(profile.user_role),
    });
  }
  if (typeof profile.is_admin === "boolean") {
    candidates.push({ column: "is_admin", role: normalizeRole(profile.is_admin) });
  }

  return candidates;
}

export function resolveRoleFromMetadata(user: User): PlatformRole {
  const app = (user.app_metadata ?? {}) as Record<string, unknown>;
  const userMeta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const appClaims =
    app.claims && typeof app.claims === "object"
      ? (app.claims as Record<string, unknown>)
      : {};
  const userClaims =
    userMeta.claims && typeof userMeta.claims === "object"
      ? (userMeta.claims as Record<string, unknown>)
      : {};

  const rawCandidates: unknown[] = [
    app.role,
    app.user_role,
    app.is_admin,
    appClaims.role,
    appClaims.user_role,
    appClaims.is_admin,
    userMeta.role,
    userMeta.user_role,
    userMeta.is_admin,
    userClaims.role,
    userClaims.user_role,
    userClaims.is_admin,
  ];

  for (const raw of rawCandidates) {
    if (raw === undefined || raw === null || raw === "") {
      continue;
    }
    if (normalizeRole(raw) === "admin") {
      return "admin";
    }
  }

  return "user";
}

async function resolveRoleFromProfilesTable(
  supabase: SupabaseClient,
  userId: string,
): Promise<PlatformRole | null> {
  // Query candidates separately so schema variations do not break role resolution.
  const selectAttempts = ["role", "user_role", "is_admin"] as const;

  for (const select of selectAttempts) {
    const { data, error } = await supabase
      .from("profiles")
      .select(select)
      .eq("id", userId)
      .maybeSingle();

    if (error || !data) {
      continue;
    }

    const candidates = roleCandidatesFromProfile(data as Record<string, unknown>);
    if (!candidates.length) {
      continue;
    }

    const adminCandidate = candidates.find((candidate) => candidate.role === "admin");
    if (adminCandidate) {
      return "admin";
    }

    return candidates[0].role;
  }

  return null;
}

export async function resolveUserRole(
  supabase: SupabaseClient,
  user: User,
): Promise<PlatformRole> {
  const profileRole = await resolveRoleFromProfilesTable(supabase, user.id);
  if (profileRole) {
    return profileRole;
  }

  return resolveRoleFromMetadata(user);
}

export async function resolveUserRoleById(
  supabase: SupabaseClient,
  userId: string,
): Promise<PlatformRole | null> {
  return resolveRoleFromProfilesTable(supabase, userId);
}
