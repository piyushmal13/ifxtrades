import CrudManager from "@/components/admin/CrudManager";
import { listWebinarAgendaItems, listWebinars } from "@/lib/data/platform";

export default async function AdminWebinarAgendaPage() {
  const [agendaItems, webinars] = await Promise.all([
    listWebinarAgendaItems(),
    listWebinars(),
  ]);

  return (
    <CrudManager
      title="Webinar Agenda"
      description="Manage agenda timeline, speaker names, profile photos, and session ordering."
      endpoint="/api/admin/webinar-agenda"
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
        { name: "speaker_image_url", label: "Speaker Profile Image URL" },
        { name: "sort_order", label: "Sort Order", type: "number" },
      ]}
      rows={agendaItems}
      columns={[
        { key: "webinar_id", label: "Webinar ID" },
        { key: "topic", label: "Topic" },
        { key: "speaker_name", label: "Speaker" },
        { key: "sort_order", label: "Order" },
      ]}
    />
  );
}

