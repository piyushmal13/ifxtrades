import CrudManager from "@/components/admin/CrudManager";
import { listBlogPosts } from "@/lib/data/platform";

export default async function AdminBlogPage() {
  const posts = await listBlogPosts("all");

  return (
    <CrudManager
      title="Blog"
      description="Manage market insight articles with SEO metadata, publication schedule, and structured research taxonomy."
      endpoint="/api/admin/blog"
      fields={[
        { name: "title", label: "Title", required: true },
        { name: "slug", label: "Slug", required: true },
        { name: "excerpt", label: "Excerpt", type: "textarea", required: true },
        { name: "body", label: "Body", type: "textarea", required: true },
        { name: "category", label: "Category", required: true },
        { name: "meta_title", label: "Meta Title" },
        { name: "meta_description", label: "Meta Description", type: "textarea" },
        { name: "published_at", label: "Publish Date", type: "date" },
      ]}
      rows={posts.map((item) => ({
        id: item.id,
        title: item.title,
        category: item.category,
        author: item.authorName,
        published: item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : "Draft",
      }))}
      columns={[
        { key: "title", label: "Title" },
        { key: "category", label: "Category" },
        { key: "author", label: "Author" },
        { key: "published", label: "Published" },
      ]}
    />
  );
}
