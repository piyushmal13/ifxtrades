import CrudManager from "@/components/admin/CrudManager";
import { listWebinars } from "@/lib/data/platform";

export default async function AdminWebinarsPage() {
  const webinars = await listWebinars();

  return (
    <CrudManager
      title="Webinars"
      description="Create and manage institutional webinar sessions with seat limits, premium toggle, and registration deadlines."
      endpoint="/api/admin/webinars"
      fields={[
        { name: "title", label: "Title", required: true },
        { name: "slug", label: "Slug", required: true },
        { name: "description", label: "Description", type: "textarea", required: true },
        { name: "venue", label: "Venue", required: true },
        { name: "capacity", label: "Capacity", type: "number", required: true },
        { name: "price", label: "Price", type: "number", required: true },
        { name: "registration_deadline", label: "Registration Deadline", type: "date", required: true },
        { name: "is_premium", label: "Premium Webinar", type: "checkbox" },
        { name: "is_published", label: "Published", type: "checkbox" },
      ]}
      rows={webinars.map((item) => ({
        id: item.id,
        title: item.title,
        venue: item.venue,
        capacity: item.capacity,
        price: item.price,
        seats: item.seatsRemaining,
      }))}
      columns={[
        { key: "title", label: "Title" },
        { key: "venue", label: "Venue" },
        { key: "capacity", label: "Capacity" },
        { key: "price", label: "Price" },
        { key: "seats", label: "Seats Remaining" },
      ]}
    />
  );
}
