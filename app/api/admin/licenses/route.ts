import {
  fromSupabaseError,
  jsonError,
  jsonItem,
  resolveAdminContext,
} from "@/lib/admin/api";

export async function PATCH(request: Request) {
  const resolved = await resolveAdminContext();
  if ("error" in resolved) return resolved.error;

  const payload = await request.json().catch(() => null);
  if (!payload || typeof payload !== "object") {
    return jsonError("Invalid request body.");
  }
  if (!payload?.licenseId) {
    return jsonError("licenseId is required.");
  }

  const update: Record<string, unknown> = {};
  if (payload.expiresAt) {
    update.expires_at = new Date(payload.expiresAt).toISOString();
  }
  if (payload.status) {
    update.status = payload.status;
  }

  if (!Object.keys(update).length) {
    return jsonError("No update fields supplied.");
  }

  const { admin } = resolved.context;
  const { data, error } = await admin
    .from("algo_licenses")
    .update(update)
    .eq("id", payload.licenseId)
    .select("*")
    .single();

  if (error) {
    return fromSupabaseError(error);
  }

  return jsonItem(data);
}
