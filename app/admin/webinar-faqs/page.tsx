export const dynamic = "force-dynamic";
import CrudManager from "@/components/admin/CrudManager";
import { listWebinarFaqs, listWebinars } from "@/lib/data/platform";

export default async function AdminWebinarFaqPage() {
  const [faqRows, webinars] = await Promise.all([listWebinarFaqs(), listWebinars()]);

  return (
    <CrudManager
      title="Webinar FAQs"
      description="Manage webinar frequently asked questions and display order."
      endpoint="/api/admin/webinar-faqs"
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
        { name: "question", label: "Question", required: true },
        { name: "answer", label: "Answer", type: "textarea", required: true },
        { name: "sort_order", label: "Sort Order", type: "number" },
      ]}
      rows={faqRows}
      columns={[
        { key: "webinar_id", label: "Webinar ID" },
        { key: "question", label: "Question" },
        { key: "sort_order", label: "Order" },
      ]}
    />
  );
}

