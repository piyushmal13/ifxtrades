import {
  fromSupabaseError,
  jsonItem,
  jsonItems,
  logMutation,
  parseJsonBody,
  resolveAdminContext,
} from "@/lib/admin/api";
import { webinarCreateSchema } from "@/lib/validation/admin";

export async function GET() {
  const resolved = await resolveAdminContext();
  if ("error" in resolved) return resolved.error;

  const { admin } = resolved.context;
  const { data, error } = await admin.from("webinars").select("*").order("created_at", { ascending: false });
  if (error) {
    return fromSupabaseError(error);
  }

  return jsonItems(data ?? []);
}

export async function POST(request: Request) {
  const resolved = await resolveAdminContext();
  if ("error" in resolved) return resolved.error;

  const parsed = await parseJsonBody(request, webinarCreateSchema);
  if ("error" in parsed) return parsed.error;

  const { admin } = resolved.context;
  const input = parsed.data;
  const { data, error } = await admin
    .from("webinars")
    .insert({
      title: input.title,
      slug: input.slug,
      description: input.description,
      venue: input.venue,
      sponsor_tier: input.sponsor_tier ?? "GOLD",
      hotel_sponsor: input.hotel_sponsor ?? null,
      capacity: input.capacity,
      price: input.price,
      registration_deadline: input.registration_deadline
        ? new Date(input.registration_deadline).toISOString()
        : null,
      starts_at: input.starts_at ? new Date(input.starts_at).toISOString() : null,
      hero_image_url: input.hero_image_url ?? null,
      promo_video_url: input.promo_video_url ?? null,
      is_premium: input.is_premium,
      is_published: input.is_published,
    })
    .select("*")
    .single();

  if (error) {
    return fromSupabaseError(error);
  }

  await logMutation(resolved.context, {
    action: "create",
    entity: "webinars",
    entityId: data?.id,
    payload: input,
  });

  return jsonItem(data);
}
