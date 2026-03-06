import {
  fromSupabaseError,
  jsonItem,
  jsonItems,
  logMutation,
  parseJsonBody,
  resolveAdminContext,
} from "@/lib/admin/api";
import { algoCreateSchema } from "@/lib/validation/admin";

export async function GET() {
  const resolved = await resolveAdminContext();
  if ("error" in resolved) return resolved.error;

  const { admin } = resolved.context;
  const { data, error } = await admin
    .from("algorithms")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return fromSupabaseError(error);
  }

  return jsonItems(data ?? []);
}

export async function POST(request: Request) {
  const resolved = await resolveAdminContext();
  if ("error" in resolved) return resolved.error;

  const parsed = await parseJsonBody(request, algoCreateSchema);
  if ("error" in parsed) return parsed.error;

  const { admin } = resolved.context;
  const input = parsed.data;
  const { data, error } = await admin
    .from("algorithms")
    .insert({
      name: input.name,
      slug: input.slug,
      description: input.description,
      risk_classification: input.risk_classification,
      monthly_roi_pct: input.monthly_roi_pct,
      min_capital: input.min_capital,
      price: input.price,
      compliance_disclaimer: input.compliance_disclaimer,
      image_url: input.image_url ?? null,
      is_active: input.is_active,
    })
    .select("*")
    .single();

  if (error) {
    return fromSupabaseError(error);
  }

  await logMutation(resolved.context, {
    action: "create",
    entity: "algorithms",
    entityId: data?.id,
    payload: input,
  });

  return jsonItem(data);
}
