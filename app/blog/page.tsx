import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { listBlogPosts } from "@/lib/data/platform";

export const metadata = buildMetadata({
  title: "Market Insights",
  description:
    "Institutional macro research and market intelligence designed for disciplined capital decision-making.",
  path: "/blog",
});

type SearchParams = Promise<{ category?: string }>;

export default async function BlogPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { category } = await searchParams;
  const selectedCategory = category?.trim() || "all";
  const posts = await listBlogPosts(selectedCategory);
  const categories = ["all", ...new Set(posts.map((post) => post.category.toLowerCase()))];

  return (
    <main className="min-h-screen bg-jpm-cream pt-28 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <p className="text-xs uppercase tracking-[0.2em] text-jpm-gold mb-2">
          Research Engine
        </p>
        <h1 className="font-serif text-4xl md:text-5xl text-jpm-navy">Market Insights</h1>
        <p className="mt-5 text-sm text-jpm-muted max-w-3xl">
          Institutional analysis written with macro discipline, risk framing, and
          execution relevance.
        </p>

        <div className="flex flex-wrap gap-2 mt-8">
          {categories.map((item) => {
            const active = selectedCategory.toLowerCase() === item;
            return (
              <Link
                key={item}
                href={item === "all" ? "/blog" : `/blog?category=${item}`}
                className={`px-4 py-2 rounded-sm text-xs uppercase tracking-[0.12em] ${
                  active
                    ? "bg-jpm-navy text-white"
                    : "bg-white border border-jpm-border text-jpm-navy"
                }`}
              >
                {item}
              </Link>
            );
          })}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
          {posts.map((post) => (
            <article key={post.id} className="card p-7">
              <p className="text-xs uppercase tracking-[0.14em] text-jpm-gold mb-2">
                {post.category}
              </p>
              <h2 className="font-serif text-2xl text-jpm-navy">{post.title}</h2>
              <p className="mt-3 text-sm text-jpm-muted leading-relaxed">
                {post.excerpt || post.body.slice(0, 150)}
              </p>
              <p className="mt-4 text-xs uppercase tracking-[0.12em] text-jpm-muted">
                {post.authorName}
              </p>
              <Link href={`/blog/${post.slug}`} className="inline-block mt-5 btn-outline">
                Read
              </Link>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
