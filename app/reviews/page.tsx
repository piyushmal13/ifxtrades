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
    <main className="min-h-screen bg-jpm-cream pt-28 pb-20 px-6">
      <div className="max-w-6xl mx-auto">
        <p className="text-xs uppercase tracking-[0.2em] text-jpm-gold mb-2">
          Authority Engine
        </p>
        <h1 className="font-serif text-4xl md:text-5xl text-jpm-navy">
          Reviews and Partnerships
        </h1>
        <p className="mt-5 text-sm text-jpm-muted max-w-3xl">
          Independent feedback and endorsements focused on process integrity,
          risk governance, and institutional communication quality.
        </p>

        <div className="grid md:grid-cols-2 gap-6 mt-12">
          {reviews.map((review) => (
            <article key={review.id} className="card p-8">
              <p className="text-xs uppercase tracking-[0.14em] text-jpm-gold mb-3">
                {review.isFeatured ? "Featured Review" : "Review"}
              </p>
              <h2 className="font-serif text-2xl text-jpm-navy">{review.companyName}</h2>
              <p className="mt-4 text-sm text-jpm-muted leading-relaxed">"{review.quote}"</p>
              {review.brokerEndorsement && (
                <p className="mt-5 text-xs uppercase tracking-[0.12em] text-jpm-muted">
                  Endorsement: {review.brokerEndorsement}
                </p>
              )}
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
