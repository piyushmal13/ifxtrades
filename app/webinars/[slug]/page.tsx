import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
import { notFound } from "next/navigation";
import { buildMetadata, eventJsonLd } from "@/lib/seo";
import { getWebinarBySlug } from "@/lib/data/platform";
import RegisterButton from "@/components/webinar/RegisterButton";
import Countdown from "@/components/webinar/Countdown";

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
  const requiresPayment = webinar.isPremium || webinar.price > 0;
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
    <main className="min-h-screen bg-[#020617] pt-28 pb-20 px-6 text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Background glow */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_0%,rgba(212,175,55,0.06),transparent)] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        <p className="text-[10px] uppercase tracking-[0.28em] text-jpm-gold/70 mb-3">
          Event Intelligence
        </p>
        <h1 className="font-serif text-4xl md:text-5xl text-white tracking-[-0.01em]">{webinar.title}</h1>
        <p className="mt-5 text-sm text-white/50 leading-relaxed max-w-4xl">
          {webinar.description}
        </p>

        {webinar.heroImageUrl && (
          <div className="w-full h-64 md:h-80 mt-8 rounded-sm overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
            <img
              src={webinar.heroImageUrl}
              alt={`${webinar.title} hero`}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <Metric label="Venue" value={webinar.venue} />
          <Metric label="Sponsor Tier" value={webinar.sponsorTier} />
          <Metric label="Seats Remaining" value={`${webinar.seatsRemaining}`} />
          <Metric label="Registration" value={registrationState} />
        </div>

        <div className="card border border-white/10 bg-white/3 backdrop-blur-md p-5 mt-6">
          <p className="text-[10px] uppercase tracking-[0.15em] text-white/40 mb-3">
            Webinar Countdown
          </p>
          <Countdown deadlineIso={webinar.deadline} startsAtIso={webinar.startsAt} />
        </div>

        <div className="card border border-white/10 bg-white/3 backdrop-blur-md p-7 mt-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.14em] text-jpm-gold/80 mb-1">
                Admission
              </p>
              <p className="font-serif text-3xl text-white">
                {webinar.price > 0 ? `$${webinar.price.toLocaleString()}` : "Free"}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <RegisterButton
                webinarId={webinar.id}
                webinarSlug={webinar.slug}
                requiresPayment={requiresPayment}
                price={webinar.price}
                disabled={!registrationOpen || !hasSeats}
              />
              {googleCalendarLink && (
                <Link
                  href={googleCalendarLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-sm text-[10px] font-bold uppercase tracking-[0.16em] text-white/60 hover:text-white transition-all"
                >
                  Add to Calendar
                </Link>
              )}
              {webinar.promoVideoUrl && (
                <Link
                  href={webinar.promoVideoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-sm text-[10px] font-bold uppercase tracking-[0.16em] text-white/60 hover:text-white transition-all"
                >
                  Watch Promo
                </Link>
              )}
            </div>
          </div>
          <p className="mt-5 text-[10px] text-white/30 uppercase tracking-[0.12em]">
            Duplicate registrations are blocked. Seat limits and deadline logic are
            enforced server-side.
          </p>
        </div>

        <section className="mt-10 grid lg:grid-cols-2 gap-8">
          <div className="card border border-white/10 bg-white/3 backdrop-blur-md p-7">
            <h2 className="font-serif text-2xl text-white mb-5">Agenda</h2>
            {webinar.agenda.length === 0 ? (
              <p className="text-sm text-white/30 italic">Agenda will be published shortly.</p>
            ) : (
              <ul className="space-y-6">
                {webinar.agenda.map((item) => (
                  <li key={item.id} className="border-l-2 border-jpm-gold/40 pl-5">
                    <p className="text-[10px] uppercase tracking-[0.12em] text-jpm-gold/70">
                      {item.time ? new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "TBA"}
                    </p>
                    <div className="mt-2 flex items-center gap-4">
                      {item.speakerImageUrl ? (
                        <img
                          src={item.speakerImageUrl}
                          alt={item.speakerName}
                          className="h-12 w-12 rounded-full object-cover border border-white/10"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-xs text-white/40">
                          {item.speakerName.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-white tracking-tight">{item.topic}</p>
                        <p className="text-sm text-white/50">{item.speakerName}</p>
                        {item.speakerLinkedin && (
                          <Link
                            href={item.speakerLinkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-jpm-gold/60 hover:text-jpm-gold hover:underline transition-colors"
                          >
                            LinkedIn Profile ↗
                          </Link>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="card border border-white/10 bg-white/3 backdrop-blur-md p-7">
            <h2 className="font-serif text-2xl text-white mb-5">Common Questions</h2>
            {webinar.faqs.length === 0 ? (
              <p className="text-sm text-white/30 italic">FAQ will be published shortly.</p>
            ) : (
              <ul className="space-y-6">
                {webinar.faqs.map((faq) => (
                  <li key={faq.id}>
                    <p className="font-semibold text-white tracking-tight">{faq.question}</p>
                    <p className="text-sm text-white/50 mt-2 leading-relaxed">{faq.answer}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className="card border border-white/10 bg-white/3 backdrop-blur-md p-7 mt-8">
          <h2 className="font-serif text-2xl text-white mb-5">Partner Roster</h2>
          {webinar.sponsors.length === 0 ? (
            <p className="text-sm text-white/30 italic">Sponsor roster pending.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {webinar.sponsors.map((sponsor) => (
                <div key={sponsor.id} className="border border-white/10 rounded-sm p-5 bg-white/5">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-jpm-gold/80">
                    {sponsor.tier} Partner
                  </p>
                  <p className="font-semibold text-white mt-1">{sponsor.name}</p>
                  {sponsor.logoUrl && (
                    <div className="h-12 w-full mt-4 opacity-70 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
                      <img
                        src={sponsor.logoUrl}
                        alt={`${sponsor.name} logo`}
                        className="h-full w-full object-contain object-left"
                      />
                    </div>
                  )}
                  {sponsor.linkUrl && (
                    <Link
                      href={sponsor.linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-jpm-gold/50 hover:text-jpm-gold hover:underline mt-4 inline-block transition-colors"
                    >
                      Institutional Profile ↗
                    </Link>
                  )}
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
    <div className="card border border-white/10 bg-white/3 backdrop-blur-md p-5 h-full">
      <p className="text-[10px] uppercase tracking-[0.18em] text-white/30">{label}</p>
      <p className="mt-2 font-serif text-xl text-white tracking-tight">{value}</p>
    </div>
  );
}
