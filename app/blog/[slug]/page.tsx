import type { Metadata } from "next";
import { notFound } from "next/navigation";
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
    <main className="min-h-screen bg-jpm-cream pt-28 pb-20 px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="max-w-4xl mx-auto card p-10">
        <p className="text-xs uppercase tracking-[0.2em] text-jpm-gold mb-3">{post.category}</p>
        <h1 className="font-serif text-4xl md:text-5xl text-jpm-navy">{post.title}</h1>
        <p className="mt-4 text-xs uppercase tracking-[0.12em] text-jpm-muted">
          {post.authorName}
          {post.publishedAt ? ` | ${new Date(post.publishedAt).toLocaleDateString()}` : ""}
        </p>
        <div className="mt-8 text-sm text-jpm-ink leading-7 whitespace-pre-wrap">
          {post.body}
        </div>
      </article>
    </main>
  );
}
