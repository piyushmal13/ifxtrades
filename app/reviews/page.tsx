export const dynamic = "force-dynamic";

import { buildMetadata } from "@/lib/seo";
import { listReviews } from "@/lib/data/platform";

export const metadata = buildMetadata({
  title: "Reviews and Authority",
  description:
    "Institutional testimonials, broker endorsements, and partner trust indicators for IFXTrades.",
  path: "/reviews",
});

export default async function ReviewsPage() {
  const reviews = await listReviews();

  return (
    <main className="min-h-screen bg-[#020617] pt-28 pb-20 px-6 text-white">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_0%,rgba(212,175,55,0.06),transparent)] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative">
        <p className="text-[10px] uppercase tracking-[0.28em] text-jpm-gold/70 mb-3">
          Authority Engine
        </p>
        <h1 className="font-serif text-4xl md:text-5xl tracking-[-0.01em]">
          Reviews and Partnerships
        </h1>
        <p className="mt-4 text-sm text-white/45 max-w-3xl leading-relaxed">
          Independent feedback and endorsements focused on process integrity,
          risk governance, and institutional communication quality.
        </p>

        {reviews.length === 0 ? (
          <p className="card p-6 mt-12 text-sm text-white/55">
            No reviews are available yet.
          </p>
        ) : (
          <div className="grid md:grid-cols-2 gap-6 mt-12">
            {reviews.map((review) => (
              <article
                key={review.id}
                className="card relative overflow-hidden border border-white/8 bg-white/3 p-8 transition-all duration-300 hover:-translate-y-1 hover:border-jpm-gold/35"
              >
                <p className="text-[10px] uppercase tracking-[0.14em] text-jpm-gold mb-3">
                  {review.isFeatured ? "Featured Review" : "Review"}
                </p>
                <h2 className="font-serif text-2xl leading-snug">{review.companyName}</h2>
                <p className="mt-4 text-sm text-white/55 leading-relaxed">
                  "{review.quote}"
                </p>
                {review.brokerEndorsement && (
                  <p className="mt-5 text-[10px] uppercase tracking-[0.12em] text-white/35">
                    Endorsement: {review.brokerEndorsement}
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
