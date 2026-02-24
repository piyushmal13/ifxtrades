export const dynamic = "force-dynamic";
import CrudManager from "@/components/admin/CrudManager";
import { listWebinarSponsors, listWebinars } from "@/lib/data/platform";

export default async function AdminWebinarSponsorsPage() {
  const [sponsorRows, webinars] = await Promise.all([
    listWebinarSponsors(),
    listWebinars(),
  ]);

  return (
    <CrudManager
      title="Webinar Sponsors"
      description="Maintain sponsor tiers, logo URLs, and outbound sponsor profile links."
      endpoint="/api/admin/webinar-sponsors"
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
        { name: "tier", label: "Tier", required: true },
        { name: "name", label: "Sponsor Name", required: true },
        { name: "logo_url", label: "Sponsor Logo URL", type: "image" },
        { name: "link_url", label: "Sponsor Link URL" },
      ]}
      rows={sponsorRows}
      columns={[
        { key: "webinar_id", label: "Webinar ID" },
        { key: "tier", label: "Tier" },
        { key: "name", label: "Sponsor" },
        { key: "logo_url", label: "Logo URL" },
      ]}
    />
  );
}

