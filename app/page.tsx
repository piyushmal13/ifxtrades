import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { listBlogPosts, listReviews } from "@/lib/data/platform";

export const metadata = buildMetadata({
  title: "Institutional Capital Intelligence",
  description:
    "Institutional webinars, algorithm licensing, structured university programs, and macro market intelligence.",
  path: "/",
});

export default async function HomePage() {
  const [posts, reviews] = await Promise.all([listBlogPosts("all"), listReviews()]);

  return (
    <main className="min-h-screen bg-jpm-cream">
      <section className="bg-jpm-navy text-white pt-28 pb-24 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs uppercase tracking-[0.2em] text-jpm-gold mb-4">
            Institutional Capital Intelligence
          </p>
          <h1 className="font-serif text-4xl md:text-6xl leading-tight max-w-4xl">
            Structured market research, licensed algorithmic systems, and
            institutional execution education.
          </h1>
          <p className="mt-6 text-white/85 text-base max-w-2xl leading-relaxed">
            IFXTrades is a disciplined capital intelligence platform built for
            professional participants focused on process, governance, and
            measurable execution quality.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/webinars" className="btn-accent">
              View Webinars
            </Link>
            <Link href="/algos" className="btn-outline border-white text-white hover:text-jpm-navy">
              Explore Algos
            </Link>
          </div>
        </div>
      </section>

      <section className="section-spacing px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-serif text-3xl text-jpm-navy mb-12">Platform Pillars</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <PillarCard
              title="Webinars"
              description="Live market briefings with institutional speakers, sponsor integrations, and structured agendas."
              href="/webinars"
            />
            <PillarCard
              title="Algo Licensing"
              description="Risk-classified strategies with transparent performance snapshots and controlled license governance."
              href="/algos"
            />
            <PillarCard
              title="University"
              description="Structured learning tracks from foundational macro concepts to institutional deployment frameworks."
              href="/university"
            />
          </div>
        </div>
      </section>

      <section className="py-14 bg-white border-y border-jpm-border px-6">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-jpm-muted">Trusted Standards</p>
          <p className="font-serif text-2xl text-jpm-navy mt-4">
            Built for disciplined capital participants.
          </p>
        </div>
      </section>

      <section className="section-spacing px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <h2 className="font-serif text-3xl text-jpm-navy">Research and Insights</h2>
            <Link href="/blog" className="text-sm font-semibold uppercase tracking-[0.12em] text-jpm-gold">
              View Blog
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {posts.slice(0, 3).map((post) => (
              <article key={post.id} className="card p-6">
                <p className="text-xs uppercase tracking-[0.14em] text-jpm-gold mb-2">{post.category}</p>
                <h3 className="font-serif text-xl text-jpm-navy mb-3">{post.title}</h3>
                <p className="text-sm text-jpm-muted leading-relaxed">{post.excerpt || post.body.slice(0, 140)}</p>
                <Link href={`/blog/${post.slug}`} className="inline-block mt-5 text-xs uppercase tracking-[0.12em] text-jpm-navy hover:text-jpm-gold">
                  Read Analysis
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-spacing px-6 bg-white border-y border-jpm-border">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-serif text-3xl text-jpm-navy mb-10">Reviews and Authority</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {reviews.slice(0, 2).map((review) => (
              <article key={review.id} className="card p-8">
                <p className="text-sm text-jpm-muted leading-relaxed">"{review.quote}"</p>
                <p className="mt-6 text-xs uppercase tracking-[0.14em] text-jpm-gold">
                  {review.companyName}
                </p>
              </article>
            ))}
          </div>
          <Link href="/reviews" className="inline-block mt-8 btn-outline">
            View All Reviews
          </Link>
        </div>
      </section>

      <footer className="bg-jpm-navy text-white py-14 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="font-serif text-xl">IFXTrades</p>
          <p className="mt-3 text-white/75 text-sm max-w-2xl">
            Institutional capital intelligence platform. All trading activity
            involves risk. Past performance is not indicative of future results.
          </p>
          <div className="mt-8 flex flex-wrap gap-4 text-xs uppercase tracking-[0.12em]">
            <Link href="/webinars">Webinars</Link>
            <Link href="/algos">Algos</Link>
            <Link href="/university">University</Link>
            <Link href="/blog">Blog</Link>
            <Link href="/reviews">Reviews</Link>
            <Link href="/login">Login</Link>
            <Link href="/signup">Signup</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

function PillarCard({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <article className="card p-8">
      <h3 className="font-serif text-2xl text-jpm-navy mb-3">{title}</h3>
      <p className="text-sm text-jpm-muted leading-relaxed">{description}</p>
      <Link
        href={href}
        className="inline-block mt-5 text-xs uppercase tracking-[0.12em] text-jpm-gold hover:underline"
      >
        Explore
      </Link>
    </article>
  );
}
