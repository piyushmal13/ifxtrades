import {
  fetchByIdWithWebinarTitle,
  fromSupabaseError,
  jsonItem,
  jsonItems,
  logMutation,
  parseJsonBody,
  resolveAdminContext,
  withWebinarTitle,
} from "@/lib/admin/api";
import { webinarSponsorCreateSchema } from "@/lib/validation/admin";

export async function GET() {
  const resolved = await resolveAdminContext();
  if ("error" in resolved) return resolved.error;

  const { admin } = resolved.context;
  const { data, error } = await admin
    .from("webinar_sponsors")
    .select("*, webinars(title)")
    .order("name", { ascending: true });

  if (error) {
    return fromSupabaseError(error);
  }

  const items = (data ?? []).map((row: any) => withWebinarTitle(row));

  return jsonItems(items);
}

export async function POST(request: Request) {
  const resolved = await resolveAdminContext();
  if ("error" in resolved) return resolved.error;

  const parsed = await parseJsonBody(request, webinarSponsorCreateSchema);
  if ("error" in parsed) return parsed.error;

  const input = parsed.data;
  const { admin } = resolved.context;
  const { data, error } = await admin
    .from("webinar_sponsors")
    .insert({
      webinar_id: input.webinar_id,
      tier: input.tier,
      name: input.name,
      logo_url: input.logo_url ?? null,
      link_url: input.link_url ?? null,
    })
    .select("*")
    .single();

  if (error) {
    return fromSupabaseError(error);
  }

  await logMutation(resolved.context, {
    action: "create",
    entity: "webinar_sponsors",
    entityId: data?.id,
    payload: input,
  });

  const item =
    (await fetchByIdWithWebinarTitle(
      admin,
      "webinar_sponsors",
      String(data?.id ?? ""),
      data?.webinar_id ?? null,
    )) ?? data;

  return jsonItem(item);
}
