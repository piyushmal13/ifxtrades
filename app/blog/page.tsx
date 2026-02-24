export const dynamic = "force-dynamic";

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
  const allPosts = await listBlogPosts("all");
  const posts =
    selectedCategory.toLowerCase() === "all"
      ? allPosts
      : allPosts.filter(
          (post) => post.category.toLowerCase() === selectedCategory.toLowerCase(),
        );
  const categories = [
    "all",
    ...new Set(allPosts.map((post) => post.category.toLowerCase())),
  ];

  return (
    <main className="min-h-screen bg-[#020617] pt-28 pb-20 px-6 text-white">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_0%,rgba(212,175,55,0.06),transparent)] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative">
        <p className="text-[10px] uppercase tracking-[0.28em] text-jpm-gold/70 mb-3">
          Research Engine
        </p>
        <h1 className="font-serif text-4xl md:text-5xl tracking-[-0.01em]">
          Market Insights
        </h1>
        <p className="mt-4 text-sm text-white/45 max-w-3xl leading-relaxed">
          Institutional analysis written with macro discipline, risk framing,
          and execution relevance.
        </p>

        <div className="flex flex-wrap gap-2 mt-8">
          {categories.map((item) => {
            const active = selectedCategory.toLowerCase() === item;
            return (
              <Link
                key={item}
                href={item === "all" ? "/blog" : `/blog?category=${item}`}
                className={`px-4 py-2 rounded-sm text-[10px] uppercase tracking-[0.16em] transition-all ${
                  active
                    ? "bg-jpm-gold/12 border border-jpm-gold/35 text-jpm-gold"
                    : "bg-white/3 border border-white/10 text-white/55 hover:text-white hover:border-white/25"
                }`}
              >
                {item}
              </Link>
            );
          })}
        </div>

        {posts.length === 0 ? (
          <p className="card p-6 mt-10 text-sm text-white/55">
            No blog posts are published yet.
          </p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
            {posts.map((post) => (
              <article
                key={post.id}
                className="card relative overflow-hidden border border-white/8 bg-white/3 p-7 transition-all duration-300 hover:-translate-y-1 hover:border-jpm-gold/40 hover:shadow-[0_20px_50px_rgba(212,175,55,0.08)]"
              >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-jpm-gold/0 via-jpm-gold/60 to-jpm-gold/0 opacity-0 hover:opacity-100 transition-opacity" />
                <p className="text-[10px] uppercase tracking-[0.14em] text-jpm-gold mb-3">
                  {post.category}
                </p>
                <h2 className="font-serif text-2xl leading-snug">{post.title}</h2>
                <p className="mt-3 text-sm text-white/50 leading-relaxed">
                  {post.excerpt || post.body.slice(0, 150)}
                </p>
                <p className="mt-4 text-[10px] uppercase tracking-[0.12em] text-white/35">
                  {post.authorName}
                </p>
                <Link
                  href={`/blog/${post.slug}`}
                  className="inline-flex items-center gap-1 mt-5 text-[10px] uppercase tracking-[0.16em] text-jpm-gold/70 hover:text-jpm-gold transition-colors"
                >
                  Read Analysis <span>-&gt;</span>
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
