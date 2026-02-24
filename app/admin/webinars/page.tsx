export const dynamic = "force-dynamic";
import CrudManager from "@/components/admin/CrudManager";
import { listWebinars } from "@/lib/data/platform";

export default async function AdminWebinarsPage() {
  const webinars = await listWebinars({ includeUnpublished: true });

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
        { name: "sponsor_tier", label: "Sponsor Tier", required: true },
        { name: "hotel_sponsor", label: "Hotel Sponsor" },
        { name: "capacity", label: "Capacity", type: "number", required: true },
        { name: "price", label: "Price", type: "number", required: true },
        {
          name: "registration_deadline",
          label: "Registration Deadline",
          type: "date",
          required: true,
        },
        { name: "starts_at", label: "Webinar Start Date", type: "date" },
        { name: "hero_image_url", label: "Hero Image URL", type: "image" },
        { name: "promo_video_url", label: "Promo Video URL" },
        { name: "is_premium", label: "Premium Webinar", type: "checkbox" },
        { name: "is_published", label: "Published", type: "checkbox" },
      ]}
      uploadFolder="webinars"
      rows={webinars.map((item) => ({
        id: item.id,
        title: item.title,
        slug: item.slug,
        description: item.description,
        venue: item.venue,
        sponsor_tier: item.sponsorTier,
        hotel_sponsor: item.hotelSponsor ?? "",
        capacity: item.capacity,
        price: item.price,
        registration_deadline: item.deadline ?? "",
        starts_at: item.startsAt ?? "",
        hero_image_url: item.heroImageUrl ?? "",
        promo_video_url: item.promoVideoUrl ?? "",
        is_premium: item.isPremium,
        is_published: item.isPublished,
      }))}
      columns={[
        { key: "title", label: "Title" },
        { key: "slug", label: "Slug" },
        { key: "venue", label: "Venue" },
        { key: "sponsor_tier", label: "Tier" },
        { key: "capacity", label: "Capacity" },
        { key: "price", label: "Price" },
        { key: "registration_deadline", label: "Deadline", type: "date" },
        { key: "is_published", label: "Published", type: "boolean" },
        { key: "hero_image_url", label: "Hero", type: "image" },
      ]}
    />
  );
}
