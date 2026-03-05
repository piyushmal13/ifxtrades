import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
import { articleJsonLd, buildMetadata } from "@/lib/seo";
import { getBlogPostBySlug } from "@/lib/data/platform";

type Params = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return buildMetadata({
      title: "Article Not Found",
      description: "The requested article is unavailable.",
      path: `/blog/${slug}`,
    });
  }

  return buildMetadata({
    title: post.title,
    description: post.excerpt || post.body.slice(0, 150),
    path: `/blog/${post.slug}`,
    image: post.featuredImageUrl ?? "/logo.png",
  });
}

export default async function BlogPostPage({ params }: Params) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const jsonLd = articleJsonLd({
    headline: post.title,
    description: post.excerpt || post.body.slice(0, 150),
    url: `https://www.ifxtrades.com/blog/${post.slug}`,
    image: post.featuredImageUrl,
    datePublished: post.publishedAt,
    authorName: post.authorName,
  });

  return (
    <main className="min-h-screen bg-[#020617] pt-20 sm:pt-28 pb-16 sm:pb-20 px-4 sm:px-6 text-white text-selection-gold">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Background glow */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_0%,rgba(212,175,55,0.06),transparent)] pointer-events-none" />

      <article className="max-w-4xl mx-auto relative z-10">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-white/30 mb-8">
          <Link href="/" className="hover:text-jpm-gold transition-colors">Intelligence</Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-jpm-gold transition-colors">Briefings</Link>
          <span>/</span>
          <span className="text-jpm-gold/60">{post.category}</span>
        </nav>

        {post.featuredImageUrl && (
          <div className="w-full h-[400px] mb-10 rounded-sm overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <img
              src={post.featuredImageUrl}
              alt={post.title}
              className="h-full w-full object-cover"
              onError={(e) => { (e.currentTarget as HTMLImageElement).closest('div')!.style.display = 'none' }}
            />
          </div>
        )}

        <div className="mb-10">
          <p className="text-[10px] uppercase tracking-[0.28em] text-jpm-gold/80 mb-4">{post.category}</p>
          <h1 className="font-serif text-4xl md:text-6xl text-white tracking-[-0.01em] leading-[1.1] mb-6">
            {post.title}
          </h1>
          <div className="flex items-center gap-4 py-6 border-y border-white/10">
            <div className="h-10 w-10 rounded-full bg-jpm-gold/10 border border-jpm-gold/20 flex items-center justify-center text-jpm-gold text-xs font-bold">
              {post.authorName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.15em] text-white">{post.authorName}</p>
              <p className="text-[10px] uppercase tracking-[0.15em] text-white/30">
                {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) : "Draft"}
              </p>
            </div>
          </div>
        </div>

        <div className="prose prose-invert prose-gold max-w-none text-white/70 leading-relaxed text-lg whitespace-pre-wrap font-light">
          {post.body}
        </div>

        <div className="mt-20 pt-10 border-t border-white/10 flex items-center justify-between">
          <Link href="/blog" className="text-[10px] uppercase tracking-[0.2em] text-jpm-gold/60 hover:text-jpm-gold transition-colors flex items-center gap-2">
            ← Operational Briefings
          </Link>
          <div className="flex gap-4">
            {/* Social icons placeholder */}
            <span className="h-8 w-8 rounded-full border border-white/10 flex items-center justify-center text-[10px] text-white/30">X</span>
            <span className="h-8 w-8 rounded-full border border-white/10 flex items-center justify-center text-[10px] text-white/30">IN</span>
          </div>
        </div>
      </article>
    </main>
  );
}
