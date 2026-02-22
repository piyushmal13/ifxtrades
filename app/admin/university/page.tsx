import CrudManager from "@/components/admin/CrudManager";
import { listCourses } from "@/lib/data/platform";

export default async function AdminUniversityPage() {
  const courses = await listCourses();

  return (
    <CrudManager
      title="University"
      description="Create and manage institutional course architecture, category structure, and publishing controls."
      endpoint="/api/admin/university"
      fields={[
        { name: "title", label: "Title", required: true },
        { name: "slug", label: "Slug", required: true },
        { name: "category", label: "Category", required: true },
        { name: "description", label: "Description", type: "textarea", required: true },
        { name: "plan_required", label: "Plan Required", required: true },
        { name: "sort_order", label: "Sort Order", type: "number" },
        { name: "is_published", label: "Published", type: "checkbox" },
      ]}
      rows={courses.map((item) => ({
        id: item.id,
        title: item.title,
        category: item.category,
        lessons: item.lessonCount,
        plan: item.planRequired,
      }))}
      columns={[
        { key: "title", label: "Title" },
        { key: "category", label: "Category" },
        { key: "lessons", label: "Lessons" },
        { key: "plan", label: "Plan" },
      ]}
    />
  );
}
