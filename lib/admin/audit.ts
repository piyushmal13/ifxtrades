import type { SupabaseClient } from "@supabase/supabase-js";

type LogInput = {
  actorId: string;
  entity: string;
  entityId: string;
  action: "create" | "update" | "delete";
  payload?: Record<string, unknown> | null;
};

export async function logAdminAction(
  admin: SupabaseClient,
  input: LogInput,
) {
  // Best effort logging to avoid blocking mutations if the table is not deployed.
  await admin.from("admin_audit_logs").insert({
    actor_id: input.actorId,
    entity: input.entity,
    entity_id: input.entityId,
    action: input.action,
    payload: input.payload ?? null,
  });
}

