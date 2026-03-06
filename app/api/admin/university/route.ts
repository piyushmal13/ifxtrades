import {
  fromSupabaseError,
  jsonItem,
  jsonItems,
  logMutation,
  parseJsonBody,
  resolveAdminContext,
} from "@/lib/admin/api";
import { universityCreateSchema } from "@/lib/validation/admin";

export async function GET() {
  const resolved = await resolveAdminContext();
  if ("error" in resolved) return resolved.error;

  const { admin } = resolved.context;
  const { data, error } = await admin
    .from("university_courses")
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

  const parsed = await parseJsonBody(request, universityCreateSchema);
  if ("error" in parsed) return parsed.error;

  const { admin } = resolved.context;
  const input = parsed.data;
  const { data, error } = await admin
    .from("university_courses")
    .insert({
      title: input.title,
      slug: input.slug,
      category: input.category,
      description: input.description ?? "",
      plan_required: input.plan_required ?? "free",
      sort_order: input.sort_order ?? 0,
      is_published: input.is_published,
    })
    .select("*")
    .single();

  if (error) {
    return fromSupabaseError(error);
  }

  await logMutation(resolved.context, {
    action: "create",
    entity: "university_courses",
    entityId: data?.id,
    payload: input,
  });

  return jsonItem(data);
}
