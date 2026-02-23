"use client";
import Link from "next/link";
import { motion } from "framer-motion";

export default function HomePageClient({ posts, reviews }: { posts: any[], reviews: any[] }) {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#020617] via-[#020617] to-jpm-cream text-jpm-navy">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_#22c55e1a,_transparent_60%),_radial-gradient(circle_at_bottom,_#0ea5e91a,_transparent_60%)]" />
        <div className="relative max-w-7xl mx-auto px-6 pt-28 pb-24 grid gap-12 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] items-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-jpm-gold/90 backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(52,211,153,0.35)]" />
              Institutional Capital Intelligence
            </p>
            <h1 className="mt-6 font-serif text-4xl md:text-6xl lg:text-7xl leading-tight text-white">
              Precision forex intelligence
              <span className="block bg-gradient-to-r from-emerald-300 via-jpm-gold to-sky-300 bg-clip-text text-transparent">
                built for institutional flow.
              </span>
            </h1>
            <p className="mt-6 text-white/80 text-base md:text-lg max-w-2xl leading-relaxed">
              IFXTrades aligns macro research, licensed algorithmic systems, and institutional execution education
              into one trusted operating environment for serious capital.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                href="/signup"
                className="btn-accent bg-gradient-to-r from-emerald-500 via-emerald-400 to-jpm-gold text-jpm-navy shadow-lg shadow-emerald-500/30 hover:shadow-emerald-400/40 transition-all duration-300 hover:-translate-y-0.5 hover:brightness-105"
              >
                Get Institutional Access
              </Link>
              <Link
                href="/webinars"
                className="btn-outline border-white/30 text-white hover:text-jpm-navy hover:bg-white/90 transition-all duration-300"
              >
                View Macro Webinars
              </Link>
            </div>
            <div className="mt-10 grid gap-6 sm:grid-cols-3 text-xs md:text-sm text-white/70">
              <HeroStat label="Average session attendance" value="1.9K+" />
              <HeroStat label="Algo strategies in governance" value="32" />
              <HeroStat label="Jurisdictions covered" value="14" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, ease: "easeOut", delay: 0.1 }}
            className="relative"
          >
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-jpm-gold/5 to-sky-500/5 blur-2xl" />
            <div className="relative rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-white/0 p-6 backdrop-blur-xl shadow-[0_18px_60px_rgba(15,23,42,0.7)]">
              <p className="text-[11px] uppercase tracking-[0.2em] text-emerald-300">
                Live Institutional Order Map
              </p>
              <p className="mt-2 text-xs text-white/60">
                Hypothetical visual for illustration only. Not a signal.
              </p>
              <div className="mt-6 h-56 md:h-64 rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 overflow-hidden relative">
                <div className="absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_top,_#22c55e,_transparent_55%),radial-gradient(circle_at_bottom,_#0ea5e9,_transparent_55%)]" />
                <AnimatedGrid />
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3 text-[11px] text-white/70">
                <div>
                  <p className="uppercase tracking-[0.18em] text-white/50">FX Themes</p>
                  <p className="mt-1 text-emerald-300">USD Liquidity / Macro Credit</p>
                </div>
                <div>
                  <p className="uppercase tracking-[0.18em] text-white/50">Risk Class</p>
                  <p className="mt-1 text-white">Systematic / Controlled Leverage</p>
                </div>
                <div>
                  <p className="uppercase tracking-[0.18em] text-white/50">Environment</p>
                  <p className="mt-1 text-white">Institutional Desk Ready</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="border-y border-white/10 bg-[#020617] px-6 py-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs md:text-sm text-white/60">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <p className="uppercase tracking-[0.18em]">Risk Governance</p>
          </div>
          <p className="max-w-xl">
            IFXTrades is an institutional-focused platform with controls designed around process, documentation,
            and risk transparency. All trading activity involves risk and may not be suitable for every participant.
          </p>
        </div>
      </section>

      {/* PLATFORM PILLARS */}
      <section className="section-spacing px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-10"
          >
            <div>
              <h2 className="font-serif text-3xl md:text-4xl text-jpm-navy">Platform Pillars</h2>
              <p className="mt-3 text-sm text-jpm-muted max-w-xl">
                A single environment for macro research, executable strategies, and structured education – designed to
                match how institutional desks actually operate.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 text-[11px] uppercase tracking-[0.18em] text-jpm-muted">
              <span className="rounded-full border border-jpm-border px-3 py-1">Governed Access</span>
              <span className="rounded-full border border-jpm-border px-3 py-1">Risk Classes</span>
              <span className="rounded-full border border-jpm-border px-3 py-1">Process First</span>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            <PillarCard
              title="Webinars"
              description="Live institutional-grade briefings with macro specialists, structured decks, and archived session notes."
              href="/webinars"
            />
            <PillarCard
              title="Algo Licensing"
              description="Risk-labelled algorithmic strategies with documented parameters, reviewable performance snapshots, and license governance."
              href="/algos"
            />
            <PillarCard
              title="University"
              description="Structured capital education – from macro foundations and execution frameworks to institutional deployment blueprints."
              href="/university"
            />
          </div>
        </div>
      </section>

      {/* RESEARCH */}
      <section className="section-spacing px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="font-serif text-3xl text-jpm-navy">Research &amp; Insights</h2>
              <p className="mt-2 text-sm text-jpm-muted max-w-xl">
                Curated research streams focused on FX, rates, and macro credit – emphasising process, not prediction.
              </p>
            </div>
            <Link
              href="/blog"
              className="hidden md:inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-jpm-gold hover:text-jpm-navy transition-colors"
            >
              View Research Stream
              <span aria-hidden>↗</span>
            </Link>
          </div>
          {posts.length === 0 ? (
            <p className="card p-6 text-sm text-jpm-muted">
              Research posts will appear here once published.
            </p>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {posts.slice(0, 3).map((post, index) => (
                <motion.article
                  key={post.id}
                  className="card group relative overflow-hidden border border-jpm-border/80 bg-white/95 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-400/70 hover:shadow-[0_18px_45px_rgba(15,23,42,0.18)]"
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                >
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-400 via-jpm-gold to-sky-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <p className="text-xs uppercase tracking-[0.14em] text-jpm-gold mb-2">{post.category}</p>
                  <h3 className="font-serif text-xl text-jpm-navy mb-3">{post.title}</h3>
                  <p className="text-sm text-jpm-muted leading-relaxed">
                    {post.excerpt || post.body.slice(0, 160)}
                  </p>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-1 mt-5 text-[11px] uppercase tracking-[0.12em] text-jpm-navy group-hover:text-emerald-500 transition-colors"
                  >
                    Read Analysis
                    <span aria-hidden>→</span>
                  </Link>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* REVIEWS */}
      <section className="section-spacing px-6 bg-white/80 border-y border-jpm-border/70 backdrop-blur">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
            <div>
              <h2 className="font-serif text-3xl text-jpm-navy">Reviews &amp; Authority</h2>
              <p className="mt-2 text-sm text-jpm-muted max-w-xl">
                Verified commentary from partners, institutions, and participants who have evaluated the IFXTrades
                environment.
              </p>
            </div>
            <Link
              href="/reviews"
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-jpm-navy hover:text-emerald-500 transition-colors"
            >
              View All Reviews
              <span aria-hidden>↗</span>
            </Link>
          </div>
          {reviews.length === 0 ? (
            <p className="card p-6 text-sm text-jpm-muted">
              Partner reviews will appear here after verification.
            </p>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {reviews.slice(0, 2).map((review, index) => (
                <motion.article
                  key={review.id}
                  className="card relative overflow-hidden border border-jpm-border bg-white p-8"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                >
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_#22c55e0d,_transparent_60%)]" />
                  <p className="relative text-sm text-jpm-muted leading-relaxed">"{review.quote}"</p>
                  <p className="relative mt-6 text-xs uppercase tracking-[0.14em] text-jpm-gold">
                    {review.companyName}
                  </p>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* FINAL CTA + FOOTER */}
      <section className="px-6 py-14 bg-gradient-to-b from-[#020617] via-[#020617] to-jpm-navy text-white">
        <div className="max-w-7xl mx-auto grid gap-10 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] items-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-300/90">Begin Your Institutional Track</p>
            <h2 className="mt-4 font-serif text-3xl md:text-4xl">
              See how IFXTrades can align with your existing capital processes.
            </h2>
            <p className="mt-4 text-sm text-white/75 max-w-xl">
              Request structured access, review sample documentation, and evaluate governance before any capital is
              deployed.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/signup"
                className="btn-accent bg-emerald-500 text-jpm-navy hover:bg-emerald-400 transition-all duration-300 hover:-translate-y-0.5 shadow-lg shadow-emerald-500/30"
              >
                Request Access
              </Link>
              <Link
                href="/login"
                className="btn-outline border-white/40 text-white hover:bg-white/90 hover:text-jpm-navy transition-all duration-300"
              >
                Existing Members
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
          >
            <p className="text-xs uppercase tracking-[0.18em] text-white/60">Risk Disclosure</p>
            <p className="mt-3 text-xs text-white/70 leading-relaxed">
              Trading foreign exchange on margin carries a high level of risk and may not be suitable for all
              investors. The leverage created by trading on margin can work against you as well as for you. Past
              performance is not indicative of future results.
            </p>
          </motion.div>
        </div>

        <footer className="mt-12 border-t border-white/15 pt-8 text-xs text-white/60">
          <div className="max-w-7xl mx-auto flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-serif text-lg text-white">IFXTrades</p>
              <p className="mt-2 max-w-xl">
                Institutional capital intelligence platform. This material is for informational purposes only and does
                not constitute investment advice or an offer to buy or sell any financial instrument.
              </p>
            </div>
            <div className="flex flex-wrap gap-4 text-[11px] uppercase tracking-[0.12em]">
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
      </section>
    </main>
  );
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur"
    >
      <p className="text-[11px] uppercase tracking-[0.18em] text-white/60">{label}</p>
      <p className="mt-1 text-lg font-semibold text-white">{value}</p>
    </motion.div>
  );
}

function AnimatedGrid() {
  const rows = 7;
  const cols = 12;
  const cells = Array.from({ length: rows * cols });

  return (
    <div className="relative h-full w-full">
      <div className="absolute inset-6 grid grid-cols-12 gap-[3px]">
        {cells.map((_, idx) => (
          <motion.div
            key={idx}
            className="h-full rounded-[3px] bg-emerald-400/5"
            animate={{
              opacity: [0.3, 1, 0.3],
              scaleY: [1, 1.5, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: (idx % cols) * 0.06,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      <motion.div
        className="absolute inset-x-10 top-6 rounded-xl border border-emerald-400/40 bg-black/40 px-3 py-2 text-[10px] text-emerald-100 shadow-[0_0_40px_rgba(34,197,94,0.7)]"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <div className="flex items-center justify-between gap-3">
          <span className="uppercase tracking-[0.2em] text-emerald-300/90">FX Liquidity Zones</span>
          <span className="text-[9px] text-emerald-100/70">Sample Illustration</span>
        </div>
      </motion.div>
    </div>
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
    <motion.article
      className="card relative overflow-hidden border border-jpm-border bg-white p-8 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-400/70 hover:shadow-[0_18px_45px_rgba(15,23,42,0.18)]"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.45 }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_#22c55e0d,_transparent_55%)]" />
      <h3 className="font-serif text-2xl text-jpm-navy mb-3">{title}</h3>
      <p className="text-sm text-jpm-muted leading-relaxed">{description}</p>
      <Link
        href={href}
        className="inline-flex items-center gap-1 mt-5 text-xs uppercase tracking-[0.12em] text-jpm-gold hover:text-jpm-navy transition-colors"
      >
        Explore
        <span aria-hidden>→</span>
      </Link>
    </motion.article>
  );
}
