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
import { webinarAgendaCreateSchema } from "@/lib/validation/admin";

export async function GET() {
  const resolved = await resolveAdminContext();
  if ("error" in resolved) return resolved.error;

  const { admin } = resolved.context;
  const { data, error } = await admin
    .from("webinar_agenda_items")
    .select("*, webinars(title)")
    .order("sort_order", { ascending: true });

  if (error) {
    return fromSupabaseError(error);
  }

  const items = (data ?? []).map((row: any) => withWebinarTitle(row));

  return jsonItems(items);
}

export async function POST(request: Request) {
  const resolved = await resolveAdminContext();
  if ("error" in resolved) return resolved.error;

  const parsed = await parseJsonBody(request, webinarAgendaCreateSchema);
  if ("error" in parsed) return parsed.error;

  const input = parsed.data;
  const { admin } = resolved.context;
  const { data, error } = await admin
    .from("webinar_agenda_items")
    .insert({
      webinar_id: input.webinar_id,
      time: input.time ? new Date(input.time).toISOString() : null,
      topic: input.topic,
      speaker_name: input.speaker_name,
      speaker_linkedin: input.speaker_linkedin ?? null,
      speaker_image_url: input.speaker_image_url ?? null,
      sort_order: input.sort_order,
    })
    .select("*")
    .single();

  if (error) {
    return fromSupabaseError(error);
  }

  await logMutation(resolved.context, {
    action: "create",
    entity: "webinar_agenda_items",
    entityId: data?.id,
    payload: input,
  });

  const item =
    (await fetchByIdWithWebinarTitle(
      admin,
      "webinar_agenda_items",
      String(data?.id ?? ""),
      data?.webinar_id ?? null,
    )) ?? data;

  return jsonItem(item);
}
