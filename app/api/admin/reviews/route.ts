import {
  fromSupabaseError,
  jsonItem,
  jsonItems,
  logMutation,
  parseJsonBody,
  resolveAdminContext,
} from "@/lib/admin/api";
import { reviewCreateSchema } from "@/lib/validation/admin";

export async function GET() {
  const resolved = await resolveAdminContext();
  if ("error" in resolved) return resolved.error;

  const { admin } = resolved.context;
  const { data, error } = await admin.from("reviews").select("*").order("created_at", { ascending: false });
  if (error) {
    return fromSupabaseError(error);
  }

  return jsonItems(data ?? []);
}

export async function POST(request: Request) {
  const resolved = await resolveAdminContext();
  if ("error" in resolved) return resolved.error;

  const parsed = await parseJsonBody(request, reviewCreateSchema);
  if ("error" in parsed) return parsed.error;

  const { admin } = resolved.context;
  const input = parsed.data;
  const { data, error } = await admin
    .from("reviews")
    .insert({
      company_name: input.company_name,
      quote: input.quote,
      video_url: input.video_url ?? null,
      broker_endorsement: input.broker_endorsement ?? null,
      is_featured: input.is_featured,
    })
    .select("*")
    .single();

  if (error) {
    return fromSupabaseError(error);
  }

  await logMutation(resolved.context, {
    action: "create",
    entity: "reviews",
    entityId: data?.id,
    payload: input,
  });

  return jsonItem(data);
}
