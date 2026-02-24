export const dynamic = "force-dynamic";

import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { listBlogPosts } from "@/lib/data/platform";

import { type Metadata } from "next";
export const metadata: Metadata = buildMetadata({
  title: "Insights",
  description: "Institutional market research, macro analysis, and systematic strategy updates.",
  path: "/blog",
});

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
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
    <main className="ifx-page-shell">
      <div className="ifx-page-container relative">
        <div className="animate-cinematic">
          <p className="text-[10px] uppercase tracking-[0.28em] text-jpm-gold/70 mb-3">
            Research Engine
          </p>
          <h1 className="font-serif text-4xl md:text-5xl tracking-[-0.01em] text-glow-gold">
            Market Insights
          </h1>
          <p className="mt-4 text-sm text-white/45 max-w-3xl leading-relaxed">
            Institutional analysis written with macro discipline, risk framing,
            and execution relevance.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mt-8 animate-cinematic" style={{ animationDelay: "0.2s" }}>
          {categories.map((item) => {
            const active = selectedCategory.toLowerCase() === item;
            return (
              <Link
                key={item}
                href={item === "all" ? "/blog" : `/blog?category=${item}`}
                className={`px-4 py-2 rounded-sm text-[10px] uppercase tracking-[0.16em] transition-all ${active
                  ? "bg-jpm-gold/12 border border-jpm-gold/35 text-jpm-gold shadow-[0_0_20px_rgba(212,175,55,0.15)]"
                  : "glass-premium text-white/55 hover:text-white hover:border-white/25"
                  }`}
              >
                {item}
              </Link>
            );
          })}
        </div>

        {posts.length === 0 ? (
          <p className="glass-premium p-6 mt-10 text-sm text-white/55 animate-cinematic" style={{ animationDelay: "0.3s" }}>
            No blog posts are published yet.
          </p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
            {posts.map((post, idx) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group block animate-cinematic"
                style={{ animationDelay: `${0.3 + idx * 0.1}s` }}
              >
                <article
                  className="glass-premium relative overflow-hidden h-full border border-white/8 p-7 transition-all duration-500 hover:-translate-y-2 hover:border-jpm-gold/40 hover:shadow-[0_20px_50px_rgba(212,175,55,0.12)]"
                >
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-jpm-gold/0 via-jpm-gold/60 to-jpm-gold/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <p className="text-[10px] uppercase tracking-[0.14em] text-jpm-gold mb-3">
                    {post.category}
                  </p>
                  <h2 className="font-serif text-2xl leading-snug group-hover:text-jpm-gold transition-colors">{post.title}</h2>
                  <p className="mt-3 text-sm text-white/50 leading-relaxed line-clamp-3">
                    {post.excerpt || post.body.slice(0, 150)}
                  </p>
                  <div className="mt-8 flex items-center justify-between">
                    <p className="text-[10px] uppercase tracking-[0.12em] text-white/35">
                      {post.authorName}
                    </p>
                    <span className="text-[10px] uppercase tracking-[0.16em] text-jpm-gold/70 group-hover:text-jpm-gold">
                      Read Analysis →
                    </span>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
