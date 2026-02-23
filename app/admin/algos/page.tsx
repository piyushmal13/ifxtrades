export const dynamic = "force-dynamic";
import CrudManager from "@/components/admin/CrudManager";
import { listAlgos } from "@/lib/data/platform";

export default async function AdminAlgosPage() {
  const algos = await listAlgos({ includeInactive: true });

  return (
    <CrudManager
      title="Algorithms"
      description="Manage strategy listings, risk classifications, pricing, and active marketplace status."
      endpoint="/api/admin/algos"
      fields={[
        { name: "name", label: "Name", required: true },
        { name: "slug", label: "Slug", required: true },
        { name: "description", label: "Description", type: "textarea", required: true },
        { name: "risk_classification", label: "Risk Classification", required: true },
        { name: "monthly_roi_pct", label: "Monthly ROI (%)", type: "number", required: true },
        { name: "min_capital", label: "Minimum Capital", type: "number", required: true },
        { name: "price", label: "Price", type: "number", required: true },
        { name: "image_url", label: "Strategy Image URL" },
        { name: "compliance_disclaimer", label: "Compliance Disclaimer", type: "textarea", required: true },
        { name: "is_active", label: "Active", type: "checkbox" },
      ]}
      rows={algos.map((item) => ({
        id: item.id,
        name: item.name,
        slug: item.slug,
        description: item.description,
        risk_classification: item.riskClass,
        monthly_roi_pct: item.monthlyRoi,
        min_capital: item.minCapital,
        price: item.price,
        image_url: item.imageUrl ?? "",
        compliance_disclaimer: item.complianceDisclaimer,
        is_active: item.isActive,
      }))}
      columns={[
        { key: "name", label: "Name" },
        { key: "slug", label: "Slug" },
        { key: "risk_classification", label: "Risk" },
        { key: "monthly_roi_pct", label: "Monthly ROI" },
        { key: "price", label: "Price" },
      ]}
    />
  );
}
