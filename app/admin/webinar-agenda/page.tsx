export const dynamic = "force-dynamic";
import CrudManager from "@/components/admin/CrudManager";
import { listWebinarAgendaItems, listWebinars } from "@/lib/data/platform";

export default async function AdminWebinarAgendaPage() {
  const [agendaItems, webinars] = await Promise.all([
    listWebinarAgendaItems(),
    listWebinars({ includeUnpublished: true }),
  ]);
  const webinarNameById = new Map(webinars.map((webinar) => [webinar.id, webinar.title]));

  return (
    <CrudManager
      title="Webinar Agenda"
      description="Manage agenda timeline, speaker names, profile photos, and session ordering."
      endpoint="/api/admin/webinar-agenda"
      uploadFolder="webinar-agenda"
      fields={[
        {
          name: "webinar_id",
          label: "Webinar",
          type: "select",
          required: true,
          options: webinars.map((webinar) => ({
            label: webinar.title,
            value: webinar.id,
          })),
        },
        { name: "time", label: "Session Time", type: "date" },
        { name: "topic", label: "Topic", required: true },
        { name: "speaker_name", label: "Speaker Name", required: true },
        { name: "speaker_linkedin", label: "Speaker LinkedIn URL" },
        {
          name: "speaker_image_url",
          label: "Speaker Profile Image URL",
          type: "image",
        },
        { name: "sort_order", label: "Sort Order", type: "number" },
      ]}
      rows={agendaItems.map((row) => ({
        ...row,
        webinar_title: webinarNameById.get(row.webinar_id) ?? row.webinar_id,
      }))}
      columns={[
        { key: "webinar_title", label: "Webinar" },
        { key: "topic", label: "Topic" },
        { key: "speaker_name", label: "Speaker" },
        { key: "speaker_image_url", label: "Speaker Image", type: "image" },
        { key: "sort_order", label: "Order" },
      ]}
    />
  );
}
