import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { listWebinars } from "@/lib/data/platform";

export const metadata = buildMetadata({
  title: "Webinars",
  description:
    "Institutional webinar calendar with agenda, speakers, sponsors, seat limits, and registration controls.",
  path: "/webinars",
});

export default async function WebinarsPage() {
  const webinars = await listWebinars();

  return (
    <main className="min-h-screen bg-jpm-cream pt-28 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <p className="text-xs uppercase tracking-[0.2em] text-jpm-gold mb-2">
          Event Intelligence
        </p>
        <h1 className="font-serif text-4xl md:text-5xl text-jpm-navy">Webinars</h1>
        <p className="mt-5 text-sm text-jpm-muted max-w-3xl">
          Institutional briefings with transparent agenda design, sponsor tiers,
          and seat governance.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          {webinars.map((webinar) => (
            <article key={webinar.id} className="card p-7 flex flex-col">
              <p className="text-xs uppercase tracking-[0.14em] text-jpm-gold mb-2">
                {webinar.isPremium ? "Premium" : "Open"} Webinar
              </p>
              <h2 className="font-serif text-2xl text-jpm-navy">{webinar.title}</h2>
              <p className="mt-3 text-sm text-jpm-muted leading-relaxed flex-1">
                {webinar.description}
              </p>
              <div className="mt-5 space-y-1 text-xs uppercase tracking-[0.12em] text-jpm-muted">
                <p>Venue: {webinar.venue}</p>
                <p>Seats Remaining: {webinar.seatsRemaining}</p>
                <p>Sponsor Tier: {webinar.sponsorTier}</p>
              </div>
              <div className="mt-6 flex items-center justify-between">
                <p className="font-serif text-2xl text-jpm-navy">
                  {webinar.price > 0 ? `$${webinar.price.toLocaleString()}` : "Free"}
                </p>
                <Link href={`/webinars/${webinar.slug}`} className="btn-primary">
                  Details
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
