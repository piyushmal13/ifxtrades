import {
  fromSupabaseError,
  jsonItem,
  jsonItems,
  logMutation,
  parseJsonBody,
  resolveAdminContext,
} from "@/lib/admin/api";
import { courseLessonCreateSchema } from "@/lib/validation/admin";

export async function GET() {
  const resolved = await resolveAdminContext();
  if ("error" in resolved) return resolved.error;

  const { admin } = resolved.context;
  const { data, error } = await admin
    .from("course_lessons")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    return fromSupabaseError(error);
  }

  return jsonItems(data ?? []);
}

export async function POST(request: Request) {
  const resolved = await resolveAdminContext();
  if ("error" in resolved) return resolved.error;

  const parsed = await parseJsonBody(request, courseLessonCreateSchema);
  if ("error" in parsed) return parsed.error;

  const input = parsed.data;
  const { admin } = resolved.context;
  const { data, error } = await admin
    .from("course_lessons")
    .insert({
      course_id: input.course_id,
      title: input.title,
      sort_order: input.sort_order,
      duration_minutes: input.duration_minutes ?? null,
      video_url: input.video_url ?? null,
      pdf_url: input.pdf_url ?? null,
      is_free: input.is_free,
    })
    .select("*")
    .single();

  if (error) {
    return fromSupabaseError(error);
  }

  await logMutation(resolved.context, {
    action: "create",
    entity: "course_lessons",
    entityId: data?.id,
    payload: input,
  });

  return jsonItem(data);
}
