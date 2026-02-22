import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildMetadata, eventJsonLd } from "@/lib/seo";
import { getWebinarBySlug } from "@/lib/data/platform";
import RegisterButton from "@/components/webinar/RegisterButton";

type Params = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const webinar = await getWebinarBySlug(slug);
  if (!webinar) {
    return buildMetadata({
      title: "Webinar Not Found",
      description: "The webinar is unavailable.",
      path: `/webinars/${slug}`,
    });
  }

  return buildMetadata({
    title: webinar.title,
    description: webinar.description.slice(0, 150),
    path: `/webinars/${webinar.slug}`,
  });
}

export default async function WebinarDetailPage({ params }: Params) {
  const { slug } = await params;
  const webinar = await getWebinarBySlug(slug);

  if (!webinar) {
    notFound();
  }

  const now = Date.now();
  const deadline = webinar.deadline ? new Date(webinar.deadline).getTime() : 0;
  const registrationOpen = !deadline || deadline > now;
  const hasSeats = webinar.seatsRemaining > 0;
  const registrationState = registrationOpen && hasSeats ? "Open" : "Closed";
  const startDate = webinar.startsAt ? new Date(webinar.startsAt) : null;
  const endDate = startDate ? new Date(startDate.getTime() + 60 * 60 * 1000) : null;
  const toCal = (value: Date) => value.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const googleCalendarLink =
    startDate && endDate
      ? `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
          webinar.title,
        )}&dates=${toCal(startDate)}/${toCal(endDate)}&details=${encodeURIComponent(
          webinar.description,
        )}&location=${encodeURIComponent(webinar.venue)}`
      : null;

  const jsonLd = eventJsonLd({
    name: webinar.title,
    description: webinar.description,
    startDate: webinar.startsAt,
    locationName: webinar.venue,
    url: `https://www.ifxtrades.com/webinars/${webinar.slug}`,
    image: webinar.heroImageUrl,
  });

  return (
    <main className="min-h-screen bg-jpm-cream pt-28 pb-20 px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-6xl mx-auto">
        <p className="text-xs uppercase tracking-[0.2em] text-jpm-gold mb-2">
          Webinar Detail
        </p>
        <h1 className="font-serif text-4xl md:text-5xl text-jpm-navy">{webinar.title}</h1>
        <p className="mt-5 text-sm text-jpm-muted leading-relaxed max-w-4xl">
          {webinar.description}
        </p>

        <div className="grid md:grid-cols-4 gap-4 mt-8">
          <Metric label="Venue" value={webinar.venue} />
          <Metric label="Sponsor Tier" value={webinar.sponsorTier} />
          <Metric label="Seats Remaining" value={`${webinar.seatsRemaining}`} />
          <Metric label="Registration" value={registrationState} />
        </div>

        <div className="card p-7 mt-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-jpm-gold mb-1">
                Admission
              </p>
              <p className="font-serif text-3xl text-jpm-navy">
                {webinar.price > 0 ? `$${webinar.price.toLocaleString()}` : "Free"}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <RegisterButton
                webinarId={webinar.id}
                webinarSlug={webinar.slug}
                disabled={!registrationOpen || !hasSeats}
              />
              {googleCalendarLink && (
                <Link href={googleCalendarLink} target="_blank" className="btn-outline">
                  Add to Calendar
                </Link>
              )}
              <Link href="/webinars" className="btn-outline">
                Back to Events
              </Link>
            </div>
          </div>
          <p className="mt-5 text-xs text-jpm-muted uppercase tracking-[0.12em]">
            Duplicate registrations are blocked. Seat limits and deadline logic are
            enforced server-side.
          </p>
        </div>

        <section className="mt-10 grid lg:grid-cols-2 gap-8">
          <div className="card p-7">
            <h2 className="font-serif text-2xl text-jpm-navy mb-5">Agenda</h2>
            {webinar.agenda.length === 0 ? (
              <p className="text-sm text-jpm-muted">Agenda will be published shortly.</p>
            ) : (
              <ul className="space-y-5">
                {webinar.agenda.map((item) => (
                  <li key={item.id} className="border-l-2 border-jpm-gold pl-4">
                    <p className="text-xs uppercase tracking-[0.12em] text-jpm-muted">
                      {item.time ? new Date(item.time).toLocaleString() : "TBA"}
                    </p>
                    <p className="font-semibold text-jpm-navy mt-1">{item.topic}</p>
                    <p className="text-sm text-jpm-muted mt-1">{item.speakerName}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="card p-7">
            <h2 className="font-serif text-2xl text-jpm-navy mb-5">FAQ</h2>
            {webinar.faqs.length === 0 ? (
              <p className="text-sm text-jpm-muted">FAQ will be published shortly.</p>
            ) : (
              <ul className="space-y-4">
                {webinar.faqs.map((faq) => (
                  <li key={faq.id}>
                    <p className="font-semibold text-jpm-navy">{faq.question}</p>
                    <p className="text-sm text-jpm-muted mt-1">{faq.answer}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className="card p-7 mt-8">
          <h2 className="font-serif text-2xl text-jpm-navy mb-5">Sponsors</h2>
          {webinar.sponsors.length === 0 ? (
            <p className="text-sm text-jpm-muted">Sponsor roster pending.</p>
          ) : (
            <div className="grid md:grid-cols-3 gap-4">
              {webinar.sponsors.map((sponsor) => (
                <div key={sponsor.id} className="border border-jpm-border rounded-sm p-4">
                  <p className="text-xs uppercase tracking-[0.12em] text-jpm-gold">
                    {sponsor.tier}
                  </p>
                  <p className="font-semibold text-jpm-navy mt-1">{sponsor.name}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-4">
      <p className="text-xs uppercase tracking-[0.14em] text-jpm-muted">{label}</p>
      <p className="mt-2 font-semibold text-jpm-navy">{value}</p>
    </div>
  );
}
