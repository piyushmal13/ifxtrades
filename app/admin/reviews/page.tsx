import CrudManager from "@/components/admin/CrudManager";
import { listReviews } from "@/lib/data/platform";

export default async function AdminReviewsPage() {
  const reviews = await listReviews();

  return (
    <CrudManager
      title="Reviews"
      description="Maintain testimonials, broker endorsements, and authority references visible on public trust surfaces."
      endpoint="/api/admin/reviews"
      fields={[
        { name: "company_name", label: "Company Name", required: true },
        { name: "quote", label: "Quote", type: "textarea", required: true },
        { name: "video_url", label: "Video URL" },
        { name: "broker_endorsement", label: "Broker Endorsement", type: "textarea" },
        { name: "is_featured", label: "Featured", type: "checkbox" },
      ]}
      rows={reviews.map((item) => ({
        id: item.id,
        company_name: item.companyName,
        quote: item.quote,
        video_url: item.videoUrl ?? "",
        broker_endorsement: item.brokerEndorsement ?? "",
        is_featured: item.isFeatured,
      }))}
      columns={[
        { key: "company_name", label: "Company" },
        { key: "is_featured", label: "Featured" },
        { key: "broker_endorsement", label: "Endorsement" },
      ]}
    />
  );
}
