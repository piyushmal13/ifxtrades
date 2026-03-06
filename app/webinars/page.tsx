export const dynamic = "force-dynamic";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { listWebinars, type WebinarSummary } from "@/lib/data/platform";

import { type Metadata } from "next";
export const metadata: Metadata = buildMetadata({
  title: "Webinars",
  description:
    "Institutional webinar calendar with agenda, speakers, sponsors, seat limits, and registration controls.",
  path: "/webinars",
});

import Countdown from "@/components/webinar/Countdown";

function SeatBar({ seatsRemaining, capacity }: { seatsRemaining: number; capacity: number }) {
  const filled = capacity > 0 ? Math.min(((capacity - seatsRemaining) / capacity) * 100, 100) : 0;
  const isAlmostFull = seatsRemaining <= Math.ceil(capacity * 0.15);
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] uppercase tracking-[0.18em] text-white/40">Seat Availability</span>
        <span className={`text-[10px] font-semibold ${isAlmostFull ? "text-red-400" : "text-emerald-400"}`}>
          {seatsRemaining} remaining
        </span>
      </div>
      <div className="h-px w-full bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-500 rounded-full ${isAlmostFull ? "bg-red-400" : "bg-emerald-400"}`}
          style={{ width: `${filled}%` }}
        />
      </div>
    </div>
  );
}

function WebinarCard({ webinar }: { webinar: WebinarSummary }) {
  const isAlmostFull = webinar.seatsRemaining <= Math.ceil(webinar.capacity * 0.15);
  const riskColorMap: Record<string, string> = {
    PLATINUM: "text-sky-300 border-sky-400/30 bg-sky-400/8",
    GOLD: "text-ifx-gold border-ifx-gold/30 bg-ifx-gold/8",
    SILVER: "text-white/60 border-white/20 bg-white/5",
  };
  const tierClass = riskColorMap[webinar.sponsorTier] ?? riskColorMap.SILVER;

  return (
    <article className="glass-premium group relative overflow-hidden border border-white/8 p-7 flex flex-col transition-all duration-500 hover:-translate-y-2 hover:border-ifx-gold/35 hover:shadow-[0_20px_60px_rgba(212,175,55,0.12)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(212,175,55,0.05),_transparent_60%)]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-ifx-gold/0 via-ifx-gold/50 to-ifx-gold/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="flex items-start justify-between gap-3 mb-4">
        <span className={`text-[10px] uppercase tracking-[0.2em] font-semibold border px-2.5 py-1 rounded-full ${tierClass}`}>
          {webinar.sponsorTier}
        </span>
        {webinar.isPremium && (
          <span className="text-[10px] uppercase tracking-[0.18em] font-semibold border border-ifx-gold/40 bg-ifx-gold/10 text-ifx-gold px-2.5 py-1 rounded-full shadow-[0_0_15px_rgba(212,175,55,0.2)]">
            Premium Access
          </span>
        )}
      </div>

      <h2 className="font-serif text-xl text-white leading-snug mb-2 group-hover:text-ifx-gold transition-colors">{webinar.title}</h2>
      <p className="text-sm text-white/45 leading-relaxed mb-4 line-clamp-2">{webinar.description}</p>

      {webinar.startsAt && (
        <div className="mb-4 p-3 glass-premium border border-white/8 rounded-sm">
          <p className="text-[9px] uppercase tracking-[0.15em] text-ifx-gold mb-2">Starts In</p>
          <Countdown startsAtIso={webinar.startsAt} deadlineIso={webinar.deadline} />
        </div>
      )}

      <SeatBar seatsRemaining={webinar.seatsRemaining} capacity={webinar.capacity} />

      <div className="mt-5 grid grid-cols-2 gap-3 text-[10px] uppercase tracking-[0.12em] text-white/35">
        <div>
          <p className="text-white/25 mb-0.5">Venue</p>
          <p className="text-white/55">{webinar.venue}</p>
        </div>
        <div>
          <p className="text-white/25 mb-0.5">Price</p>
          <p className={`font-semibold ${webinar.price > 0 ? "text-ifx-gold" : "text-emerald-400"}`}>
            {webinar.price > 0 ? `$${webinar.price.toLocaleString()}` : "Free"}
          </p>
        </div>
        {isAlmostFull && (
          <div className="col-span-2">
            <p className="text-red-400/80 text-[10px] uppercase tracking-[0.18em] font-semibold">⚠ Almost Full</p>
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <p className="font-serif text-2xl text-white">
          {webinar.price > 0 ? `$${webinar.price.toLocaleString()}` : "Free"}
        </p>
        <Link
          href={`/webinars/${webinar.slug}`}
          className="bg-gradient-to-r from-ifx-gold-muted via-ifx-gold to-ifx-gold text-[#020617] px-5 py-2.5 rounded-sm text-[10px] font-bold uppercase tracking-[0.16em] hover:shadow-[0_0_20px_rgba(212,175,55,0.35)] transition-all duration-300 hover:-translate-y-px"
        >
          Register →
        </Link>
      </div>
    </article>
  );
}

export default async function WebinarsPage() {
  const webinars = await listWebinars();

  return (
    <main className="ifx-page-shell">
      <div className="ifx-page-container relative">
        <div className="mb-14 animate-cinematic">
          <p className="text-[10px] uppercase tracking-[0.28em] text-ifx-gold/70 mb-3">Event Intelligence</p>
          <h1 className="font-serif text-4xl md:text-5xl text-white tracking-[-0.01em] text-glow-gold">Institutional Webinars</h1>
          <p className="mt-4 text-sm text-white/45 max-w-2xl leading-relaxed">
            Institutional briefings with transparent agenda design, sponsor tiers, and seat governance.
            All sessions are structured for institutional participants and documented with risk framing.
          </p>
        </div>

        {webinars.length === 0 ? (
          <div className="space-y-8 animate-cinematic" style={{ animationDelay: "0.2s" }}>
            <p className="text-sm text-white/60">
              No webinars are available right now. New institutional sessions will be announced shortly.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[0, 1, 2].map((i) => (
                <div key={i} className="glass-premium border border-white/10 p-7 animate-pulse">
                  <div className="flex justify-between mb-6">
                    <div className="h-4 w-16 bg-white/10 rounded-full" />
                    <div className="h-4 w-12 bg-white/10 rounded-full" />
                  </div>
                  <div className="h-7 w-3/4 bg-white/20 rounded-sm mb-3" />
                  <div className="h-4 w-full bg-white/10 rounded-sm mb-6" />
                  <div className="h-16 w-full bg-white/5 rounded-sm mb-6" />
                  <div className="h-1 bg-white/10 w-full mb-6" />
                  <div className="h-10 w-full bg-white/10 rounded-sm" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {webinars.map((webinar, idx) => (
              <div key={webinar.id} className="animate-cinematic" style={{ animationDelay: `${0.2 + idx * 0.1}s` }}>
                <WebinarCard webinar={webinar} />
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
