import { NextResponse } from "next/server";
import type { z } from "zod";
import { requireAdminApi } from "@/lib/auth";
import { logAdminAction } from "@/lib/admin/audit";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type AdminGuard = Awaited<ReturnType<typeof requireAdminApi>>;
type GuardedAuth = Exclude<AdminGuard["auth"], null>;

export type AdminContext = {
  admin: ReturnType<typeof createSupabaseAdminClient>;
  auth: GuardedAuth;
  actorId: string | null;
};

export type RouteParams = { params: Promise<{ id: string }> };

export async function getRouteId(params: RouteParams["params"]) {
  const resolved = await params;
  return resolved.id;
}

export async function resolveAdminContext(): Promise<
  { error: NextResponse } | { context: AdminContext }
> {
  const guard = await requireAdminApi();
  if (guard.error || !guard.auth) {
    return {
      error:
        guard.error ??
        NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  return {
    context: {
      admin: createSupabaseAdminClient(),
      auth: guard.auth,
      actorId: guard.auth.user?.id ?? null,
    },
  };
}

export function jsonError(error: string, status = 400) {
  return NextResponse.json({ error }, { status });
}

export function jsonItems(items: unknown[]) {
  return NextResponse.json({ items });
}

export function jsonItem(item: unknown) {
  return NextResponse.json({ item });
}

export function jsonDeleteOk(id: string) {
  return NextResponse.json({ ok: true, id });
}

export function fromSupabaseError(error: { message: string }, status = 400) {
  return jsonError(error.message, status);
}

export async function parseJsonBody<TSchema extends z.ZodTypeAny>(
  request: Request,
  schema: TSchema,
): Promise<
  | { data: z.infer<TSchema> }
  | { error: NextResponse }
> {
  const body = await request.json().catch(() => null);
  if (body === null) {
    return { error: jsonError("Invalid JSON body.", 400) };
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return {
      error: jsonError(
        parsed.error.issues[0]?.message ?? "Invalid request body.",
        400,
      ),
    };
  }

  return { data: parsed.data };
}

export async function logMutation(
  context: AdminContext,
  mutation: {
    action: "create" | "update" | "delete";
    entity: string;
    entityId?: unknown;
    payload?: Record<string, unknown>;
  },
) {
  if (!context.actorId || !mutation.entityId) {
    return;
  }

  await logAdminAction(context.admin, {
    actorId: context.actorId,
    action: mutation.action,
    entity: mutation.entity,
    entityId: String(mutation.entityId),
    payload: mutation.payload ?? null,
  });
}

export function assignIfPresent(
  target: Record<string, unknown>,
  source: Record<string, unknown>,
  sourceKey: string,
  options?: {
    targetKey?: string;
    nullIfNil?: boolean;
    map?: (value: unknown) => unknown;
  },
) {
  if (!(sourceKey in source)) {
    return;
  }

  const rawValue = source[sourceKey];
  const value = options?.map
    ? options.map(rawValue)
    : options?.nullIfNil
      ? rawValue ?? null
      : rawValue;

  target[options?.targetKey ?? sourceKey] = value;
}

export function withWebinarTitle(row: Record<string, any>) {
  return {
    ...row,
    webinar_title: row.webinars?.title ?? row.webinar_id,
  };
}

export async function fetchByIdWithWebinarTitle(
  admin: ReturnType<typeof createSupabaseAdminClient>,
  table: string,
  id: string,
  fallbackWebinarId?: string | null,
) {
  const { data } = await admin
    .from(table)
    .select("*, webinars(title)")
    .eq("id", id)
    .single();

  if (!data) {
    return null;
  }

  const row = data as Record<string, any>;
  return {
    ...row,
    webinar_title: row.webinars?.title ?? fallbackWebinarId ?? row.webinar_id,
  };
}

