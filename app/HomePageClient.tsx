"use client";
import Link from "next/link";
import { motion, AnimatePresence, useInView, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { containerVariants, itemVariants, GRAVITY } from "@/lib/animations";

// ─── Animated Counter ─────────────────────────────────────────────────────────
function AnimatedCounter({ value, suffix = "", prefix = "" }: { value: number; suffix?: string; prefix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { damping: 60, stiffness: 100 });
  const display = useTransform(spring, (v) => `${prefix}${Math.round(v).toLocaleString()}${suffix}`);
  useEffect(() => { if (inView) motionValue.set(value); }, [inView, motionValue, value]);
  return <motion.span ref={ref}>{display}</motion.span>;
}

// ─── Types ────────────────────────────────────────────────────────────────────
type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  body: string;
  category: string;
  featuredImageUrl?: string | null;
};

type Review = {
  id: string;
  companyName: string;
  quote: string;
  videoUrl?: string | null;
  isFeatured?: boolean;
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function HomePageClient({ posts, reviews }: { posts: Post[]; reviews: Review[] }) {
  return (
    <main className="min-h-screen text-ifx-text overflow-x-hidden" style={{ background: "#080C14" }}>
      <HeroSection />
      <div className="relative z-10">
        <TrustStrip />
        <PlatformPillars />
        <StatsSection />
        <ResearchSection posts={posts} />
        <ReviewsSection reviews={reviews} />
        <CTASection />
      </div>
    </main>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
const HERO_WORDS = ["Precision", "forex"];
const HERO_WORDS_2 = ["intelligence", "built"];

function HeroSection() {
  return (
    <section className="relative overflow-hidden min-h-[95vh] flex items-center">
      {/* Background layers */}
      <div className="absolute inset-0" style={{ background: "#080C14" }} />
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(201,168,76,0.14), transparent)" }}
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 40% 50% at 80% 80%, rgba(34,197,94,0.04), transparent)" }} />

      {/* Floating symbols */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
        <FloatingElement symbol="¥" style={{ top: "15%", left: "8%" }} delay={0} duration={13} size="text-4xl" blur="blur-[1px]" zIndex="z-[1]" />
        <FloatingElement symbol="$" style={{ top: "62%", left: "4%" }} delay={2} duration={16} size="text-6xl" blur="" zIndex="z-[3]" />
        <FloatingElement symbol="€" style={{ top: "18%", right: "10%" }} delay={1} duration={14} size="text-5xl" blur="blur-[1px]" zIndex="z-[2]" />
        <FloatingElement symbol="£" style={{ top: "72%", right: "7%" }} delay={3} duration={17} size="text-5xl" blur="" zIndex="z-[2]" />
      </div>

      <div className="relative max-w-[1280px] mx-auto px-6 md:px-12 py-28 grid gap-16 lg:grid-cols-[1.1fr_1fr] items-center w-full z-10">
        {/* Left copy */}
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          {/* Live badge */}
          <motion.div variants={itemVariants} className="inline-flex items-center gap-3 rounded-full px-5 py-2 mb-8"
            style={{ border: "1px solid rgba(201,168,76,0.3)", background: "rgba(13,20,33,0.7)" }}>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full" style={{ background: "#C9A84C", opacity: 0.75 }} />
              <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: "#C9A84C" }} />
            </span>
            <span className="text-[10px] uppercase tracking-[0.28em] font-semibold" style={{ color: "#C9A84C" }}>Institutional Capital Intelligence</span>
          </motion.div>

          {/* Word-by-word headline */}
          <motion.h1 className="font-serif leading-[1.05] tracking-[-0.02em] font-medium" style={{ fontSize: "clamp(40px, 7vw, 88px)", color: "#F0EDE8" }}>
            <span className="block">
              {HERO_WORDS.map((w, i) => (
                <motion.span key={w} className="inline-block mr-4" variants={itemVariants} style={{ transitionDelay: `${i * 0.06}s` }}>{w}</motion.span>
              ))}
            </span>
            <span className="block mt-2">
              {HERO_WORDS_2.map((w, i) => (
                <motion.span key={w}
                  className="inline-block mr-4 italic"
                  variants={itemVariants}
                  style={{ color: "#C9A84C", transitionDelay: `${(i + 2) * 0.06}s` }}
                >{w}</motion.span>
              ))}
            </span>
            <motion.span className="block mt-1" variants={itemVariants} style={{ color: "rgba(240,237,232,0.85)" }}>
              for institutional flow.
            </motion.span>
          </motion.h1>

          <motion.p variants={itemVariants} className="mt-8 text-base md:text-lg max-w-[480px] leading-relaxed tracking-wide" style={{ color: "#8A95A3" }}>
            IFXTrades aligns macro research, licensed algorithmic systems, and institutional execution education into a single, uncompromising environment.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={itemVariants} className="mt-10 flex flex-wrap items-center gap-5">
            <Link
              href="/signup"
              className="group relative overflow-hidden rounded-xl font-bold uppercase text-sm tracking-widest transition-all"
              style={{ padding: "14px 32px", background: "linear-gradient(135deg, #8B6914 0%, #C9A84C 50%, #E6C97A 100%)", color: "#080C14", backgroundSize: "200%" }}
            >
              <motion.span
                className="absolute inset-0"
                style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)", backgroundSize: "200%" }}
                initial={{ backgroundPosition: "-200% 0" }}
                whileHover={{ backgroundPosition: "200% 0" }}
                transition={{ duration: 0.8 }}
              />
              <span className="relative">Request Institutional Access →</span>
            </Link>
            <Link
              href="/webinars"
              className="group flex items-center gap-2 font-semibold uppercase text-sm tracking-widest transition-all"
              style={{ color: "#8A95A3", padding: "14px 24px", border: "1px solid rgba(201,168,76,0.25)", borderRadius: "12px" }}
            >
              <span>View Intelligence</span>
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </Link>
          </motion.div>
        </motion.div>

        {/* Right: Globe placeholder */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: GRAVITY, delay: 0.3 }}
          className="hidden lg:flex items-center justify-center"
        >
          <div className="relative w-[420px] h-[420px] rounded-full"
            style={{ border: "1px solid rgba(201,168,76,0.15)", background: "radial-gradient(circle at 30% 30%, rgba(201,168,76,0.08), transparent 70%)" }}>
            <div className="absolute inset-[20%] rounded-full"
              style={{ border: "1px dashed rgba(201,168,76,0.2)", animation: "spin 30s linear infinite" }} />
            <div className="absolute inset-[40%] rounded-full"
              style={{ border: "1px dashed rgba(201,168,76,0.15)", animation: "spin 20s linear infinite reverse" }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-serif text-7xl" style={{ color: "rgba(201,168,76,0.6)" }}>⊕</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="w-px h-12" style={{ background: "linear-gradient(to bottom, transparent, rgba(201,168,76,0.5))" }} />
        <span className="text-[9px] tracking-[0.3em] uppercase" style={{ color: "rgba(201,168,76,0.4)" }}>Scroll</span>
      </motion.div>
    </section>
  );
}

// ─── Stats Section ────────────────────────────────────────────────────────────
function StatsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  const stats = [
    { value: 2400, suffix: "+", label: "Platform Members", prefix: "" },
    { value: 847, suffix: "M+", label: "Volume Tracked", prefix: "$" },
    { value: 94.2, suffix: "%", label: "Signal Accuracy Rate", prefix: "" },
    { value: 156, suffix: "+", label: "Institutional Partners", prefix: "" },
  ];

  return (
    <section ref={ref} className="py-20" style={{ background: "#0D1421", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
      <div className="max-w-[1280px] mx-auto px-6 md:px-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12"
        >
          {stats.map((s) => (
            <motion.div key={s.label} variants={itemVariants} className="text-center">
              <div className="font-serif font-bold mb-2" style={{ fontSize: "clamp(36px, 4vw, 56px)", color: "#C9A84C" }}>
                {inView ? <AnimatedCounter value={s.value} prefix={s.prefix} suffix={s.suffix} /> : `${s.prefix}0${s.suffix}`}
              </div>
              <div className="text-xs tracking-[0.15em] uppercase" style={{ color: "#8A95A3" }}>{s.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
{/* Enterprise trust signals */ }
<div className="mt-10 flex flex-wrap items-center gap-5 py-5 border-y border-white/6">
  {[
    { icon: "🔒", text: "256-bit SSL" },
    { icon: "✅", text: "KYC/AML Compliant" },
    { icon: "🛡️", text: "ISO 27001" },
    { icon: "📋", text: "Audit Logs" },
  ].map((item) => (
    <div key={item.text} className="trust-item">
      <span className="text-sm" aria-hidden="true">{item.icon}</span>
      <span>{item.text}</span>
    </div>
  ))}
</div>


{/* Globe SVG */ }
<motion.div
  className="relative z-10 w-[400px] h-[400px]"
  animate={{ rotate: 360 }}
  transition={{ duration: 130, repeat: Infinity, ease: "linear" }}
>
  <svg viewBox="0 0 100 100" className="w-full h-full opacity-70 overflow-visible drop-shadow-[0_0_18px_rgba(212,175,55,0.35)]">
    <defs>
      <linearGradient id="gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f3e5ab" />
        <stop offset="50%" stopColor="#d4af37" />
        <stop offset="100%" stopColor="#aa8c2c" />
      </linearGradient>
    </defs>
    {/* Latitudes */}
    <ellipse cx="50" cy="50" rx="49" ry="12" fill="none" stroke="url(#gold-grad)" strokeWidth="0.2" opacity="0.4" />
    <ellipse cx="50" cy="50" rx="49" ry="25" fill="none" stroke="url(#gold-grad)" strokeWidth="0.2" opacity="0.5" />
    <ellipse cx="50" cy="50" rx="49" ry="38" fill="none" stroke="url(#gold-grad)" strokeWidth="0.2" opacity="0.4" />
    <circle cx="50" cy="50" r="49" fill="none" stroke="url(#gold-grad)" strokeWidth="0.5" />
    {/* Longitudes */}
    <ellipse cx="50" cy="50" rx="12" ry="49" fill="none" stroke="url(#gold-grad)" strokeWidth="0.2" opacity="0.4" />
    <ellipse cx="50" cy="50" rx="25" ry="49" fill="none" stroke="url(#gold-grad)" strokeWidth="0.2" opacity="0.5" />
    <line x1="50" y1="1" x2="50" y2="99" stroke="url(#gold-grad)" strokeWidth="0.4" opacity="0.45" />
    {/* Pulsing data nodes */}
    <circle cx="25" cy="30" r="1.8" fill="#d4af37" className="animate-pulse" />
    <circle cx="70" cy="38" r="1.8" fill="#d4af37" className="animate-pulse" style={{ animationDelay: "1s" }} />
    <circle cx="45" cy="68" r="1.8" fill="#d4af37" className="animate-pulse" style={{ animationDelay: "0.5s" }} />
    <circle cx="78" cy="62" r="1.8" fill="#d4af37" className="animate-pulse" style={{ animationDelay: "1.5s" }} />
    <circle cx="30" cy="58" r="1.8" fill="#d4af37" className="animate-pulse" style={{ animationDelay: "0.2s" }} />
    {/* Connections */}
    <path d="M25,30 Q47,18 70,38" fill="none" stroke="rgba(212,175,55,0.35)" strokeWidth="0.35" strokeDasharray="1.5 1.5" />
    <path d="M70,38 Q62,58 78,62" fill="none" stroke="rgba(212,175,55,0.35)" strokeWidth="0.35" strokeDasharray="1.5 1.5" />
    <path d="M25,30 Q36,50 45,68" fill="none" stroke="rgba(212,175,55,0.35)" strokeWidth="0.35" strokeDasharray="1.5 1.5" />
    <path d="M45,68 Q36,64 30,58" fill="none" stroke="rgba(212,175,55,0.35)" strokeWidth="0.35" strokeDasharray="1.5 1.5" />
    <path d="M30,58 Q28,44 25,30" fill="none" stroke="rgba(212,175,55,0.2)" strokeWidth="0.25" strokeDasharray="1 2" />
  </svg>
</motion.div>



// ─── Live Clock ───────────────────────────────────────────────────────────────
function LiveClock() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const tick = () =>
      setTime(
        new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit", timeZoneName: "short" }).format(new Date())
      );
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);
  return <p className="text-sm text-white font-serif tabular-nums">{time || "Loading…"}</p>;
}

// ─── Trust Strip ─────────────────────────────────────────────────────────────────────
const TRUST_ITEMS = [
  { icon: "🔒", text: "256-BIT SSL" },
  { icon: "🛡", text: "ISO 27001" },
  { icon: "✅", text: "KYC/AML COMPLIANT" },
  { icon: "📋", text: "AUDIT LOGS" },
];

function TrustStrip() {
  return (
    <section style={{ borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "#0D1421" }} className="px-6 py-5">
      <div className="max-w-[1280px] mx-auto flex flex-wrap items-center justify-between gap-x-8 gap-y-3">
        {TRUST_ITEMS.map((item) => (
          <div key={item.text} className="flex items-center gap-2">
            <span className="text-sm">{item.icon}</span>
            <span className="text-[11px] tracking-[0.2em] uppercase" style={{ color: "#8A95A3" }}>{item.text}</span>
          </div>
        ))}
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: "#22C55E" }} />
          <span className="text-[11px] tracking-[0.2em] uppercase font-semibold" style={{ color: "#22C55E" }}>ALL SYSTEMS OPERATIONAL</span>
        </div>
      </div>
    </section>
  );
}

// ─── Platform Pillars ────────────────────────────────────────────────────────
function PlatformPillars() {
  return (
    <section className="section-spacing px-6" style={{ background: "#080C14", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-12"
        >
          <div>
            <p className="text-[10px] uppercase tracking-[0.28em] text-jpm-gold/70 mb-3">The Architecture</p>
            <h2 className="font-serif text-3xl md:text-4xl text-white tracking-[-0.01em]">Platform Pillars</h2>
            <p className="mt-3 text-sm text-white/50 max-w-xl leading-relaxed">
              A single environment for macro research, executable strategies, and structured education – designed to
              match how institutional desks actually operate.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.2em] text-white/40">
            <span className="rounded-full border border-white/8 bg-white/3 px-3 py-1">Governed Access</span>
            <span className="rounded-full border border-white/8 bg-white/3 px-3 py-1">Risk Classes</span>
            <span className="rounded-full border border-white/8 bg-white/3 px-3 py-1">Process First</span>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          <PillarCard
            icon={<WebinarIcon />}
            title="Webinars"
            description="Live institutional-grade briefings with macro specialists, structured decks, and archived session notes."
            href="/webinars"
            delay={0}
          />
          <PillarCard
            icon={<AlgoIcon />}
            title="Algo Licensing"
            description="Risk-labelled algorithmic strategies with documented parameters, reviewable performance snapshots, and license governance."
            href="/algos"
            delay={0.1}
          />
          <PillarCard
            icon={<UniversityIcon />}
            title="University"
            description="Structured capital education – from macro foundations and execution frameworks to institutional deployment blueprints."
            href="/university"
            delay={0.2}
          />
        </div>
      </div>
    </section>
  );
}

// ─── Research Section ────────────────────────────────────────────────────────
function ResearchSection({ posts }: { posts: Post[] }) {
  return (
    <section className="section-spacing px-6 bg-[#060a14]">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-10">
          <div>
            <p className="text-[10px] uppercase tracking-[0.28em] text-jpm-gold/70 mb-3">Research Desk</p>
            <h2 className="font-serif text-3xl text-white">Research & Insights</h2>
            <p className="mt-2 text-sm text-white/50 max-w-xl">
              Curated research streams focused on FX, rates, and macro credit – emphasising process, not prediction.
            </p>
          </div>
          <Link
            href="/blog"
            className="hidden md:inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-jpm-gold hover:text-white transition-colors"
          >
            View Research Stream <span>↗</span>
          </Link>
        </div>

        {posts.length === 0 ? (
          <div className="grid md:grid-cols-3 gap-6">
            {[0, 1, 2].map((i) => (
              <div key={i} className="card border border-white/5 p-6 animate-pulse">
                <div className="skeleton h-3 w-16 rounded mb-4" />
                <div className="skeleton h-6 rounded mb-2" />
                <div className="skeleton h-4 rounded w-3/4 mb-1" />
                <div className="skeleton h-4 rounded w-1/2" />
                <div className="skeleton h-3 w-20 rounded mt-6" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {posts.slice(0, 3).map((post, index) => (
              <motion.article
                key={post.id}
                className="glass-premium group relative overflow-hidden border border-white/8 p-6 transition-all duration-500 hover:-translate-y-2 hover:border-jpm-gold/40 hover:shadow-[0_22px_60px_rgba(212,175,55,0.12)]"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.7, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] }}
              >
                {post.featuredImageUrl && (
                  <div className="w-full h-36 rounded-md overflow-hidden mb-5 -mx-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={post.featuredImageUrl} alt={post.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-jpm-gold/0 via-jpm-gold/60 to-jpm-gold/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <p className="text-[10px] uppercase tracking-[0.18em] text-jpm-gold mb-3">{post.category}</p>
                <h3 className="font-serif text-xl text-white mb-3 leading-snug">{post.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">
                  {post.excerpt || post.body.slice(0, 150)}
                </p>
                <Link
                  href={`/blog/${post.slug}`}
                  className="inline-flex items-center gap-1 mt-5 text-[10px] uppercase tracking-[0.14em] text-white/40 group-hover:text-jpm-gold transition-colors"
                >
                  Read Analysis <span>→</span>
                </Link>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Reviews Section ─────────────────────────────────────────────────────────
function ReviewsSection({ reviews }: { reviews: Review[] }) {
  return (
    <section className="section-spacing px-6 bg-[#020617] border-y border-white/5 relative overflow-hidden">
      <div className="pointer-events-none absolute top-0 right-0 w-[700px] h-[700px] bg-[radial-gradient(circle_at_center,_rgba(212,175,55,0.04),_transparent_65%)]" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div>
            <p className="text-[10px] uppercase tracking-[0.28em] text-jpm-gold/70 mb-3">Authority</p>
            <h2 className="font-serif text-3xl text-white">Reviews & Institutional Feedback</h2>
            <p className="mt-2 text-sm text-white/50 max-w-xl">
              Verified commentary from partners, institutions, and participants who have evaluated the IFXTrades environment.
            </p>
          </div>
          <Link
            href="/reviews"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/50 hover:text-jpm-gold transition-colors"
          >
            View All Reviews <span>↗</span>
          </Link>
        </div>

        {reviews.length === 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {[0, 1].map((i) => (
              <div key={i} className="card border border-white/5 p-8 animate-pulse">
                <div className="skeleton h-4 rounded mb-2" />
                <div className="skeleton h-4 rounded w-4/5 mb-2" />
                <div className="skeleton h-4 rounded w-3/5 mb-6" />
                <div className="skeleton h-3 w-28 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {reviews.slice(0, 4).map((review, index) => (
              <motion.article
                key={review.id}
                className="glass-gold relative overflow-hidden border border-white/8 p-8"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.7, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(212,175,55,0.04),_transparent_65%)]" />
                {review.videoUrl && (
                  <div className="absolute top-4 right-4 cursor-pointer">
                    <div className="w-8 h-8 rounded-full bg-jpm-gold/20 flex items-center justify-center border border-jpm-gold/30 hover:bg-jpm-gold/30 transition-colors">
                      <PlayIcon />
                    </div>
                  </div>
                )}
                {/* Quote mark */}
                <div className="text-jpm-gold/20 font-serif text-5xl leading-none mb-4 select-none">"</div>
                <p className="relative text-sm text-white/65 leading-relaxed font-light italic">{review.quote}</p>
                <div className="relative mt-6 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-jpm-gold">{review.companyName}</p>
                    <div className="flex gap-0.5 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="text-jpm-gold text-xs">★</span>
                      ))}
                    </div>
                  </div>
                  <span className="text-[8px] bg-jpm-gold/8 border border-jpm-gold/25 text-jpm-gold/80 px-2 py-0.5 rounded uppercase tracking-[0.18em] font-semibold">
                    Verified
                  </span>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ─── CTA Section ─────────────────────────────────────────────────────────────
function CTASection() {
  return (
    <section className="px-6 py-20 bg-gradient-to-b from-[#020617] via-[#040b1a] to-[#020617] text-white">
      <div className="max-w-7xl mx-auto grid gap-10 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] items-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-[10px] uppercase tracking-[0.28em] text-emerald-300/80">Begin Your Institutional Track</p>
          <h2 className="mt-4 font-serif text-3xl md:text-[2.6rem] leading-tight tracking-[-0.01em]">
            See how IFXTrades can align with your existing capital processes.
          </h2>
          <p className="mt-4 text-sm text-white/60 max-w-xl leading-relaxed">
            Request structured access, review sample documentation, and evaluate governance before any capital is deployed.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/signup"
              className="btn-accent bg-gradient-to-r from-jpm-gold-dark via-jpm-gold to-jpm-gold-light text-[#020617] hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] transition-all duration-300 hover:-translate-y-0.5"
            >
              Request Access
            </Link>
            <Link
              href="/login"
              className="btn-outline border-white/25 text-white/70 hover:text-white hover:border-white/50 transition-all duration-300"
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
          className="rounded-2xl border border-white/8 bg-white/3 p-7 backdrop-blur-xl"
        >
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/50 mb-4">Risk Disclosure</p>
          <div className="w-8 h-px bg-jpm-gold/30 mb-4" />
          <p className="text-xs text-white/60 leading-relaxed">
            Trading foreign exchange on margin carries a high level of risk and may not be suitable for all
            investors. The leverage created by trading on margin can work against you as well as for you. Past
            performance is not indicative of future results. IFXTrades does not provide personalised investment advice.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Sub-Components ───────────────────────────────────────────────────────────

function V3Stat({ label, value, suffix = "" }: { label: string; value: string | number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const numericValue = typeof value === "string" ? parseFloat(value.replace(/[^0-9.]/g, "")) : value;

  useEffect(() => {
    if (isNaN(numericValue)) return;
    let start = 0;
    const end = numericValue;
    const duration = 2000;
    const increment = end / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [numericValue]);

  return (
    <div className="flex flex-col gap-1">
      <p className="text-3xl font-serif text-jpm-gold tracking-tight">
        {typeof value === "string" && value.includes("$") ? "$" : ""}
        {numericValue % 1 === 0 ? count.toFixed(0) : count.toFixed(2)}
        {suffix || (typeof value === "string" ? value.replace(/[0-9.$]/g, "") : "")}
      </p>
      <p className="text-[10px] uppercase tracking-[0.22em] text-white/40">{label}</p>
    </div>
  );
}

function PillarCard({
  icon,
  title,
  description,
  href,
  delay = 0,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  delay?: number;
}) {
  return (
    <motion.article
      className="card group relative overflow-hidden border border-white/8 bg-white/3 p-8 transition-all duration-300 hover:-translate-y-1.5 hover:border-jpm-gold/35 hover:shadow-[0_20px_50px_rgba(212,175,55,0.08)] backdrop-blur-md"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.45, delay }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(212,175,55,0.06),_transparent_55%)]" />
      <div className="w-12 h-12 rounded-lg bg-jpm-gold/10 border border-jpm-gold/20 flex items-center justify-center mb-6 text-jpm-gold transition-all duration-300 group-hover:bg-jpm-gold/15 group-hover:border-jpm-gold/35 group-hover:shadow-[0_0_20px_rgba(212,175,55,0.15)]">
        {icon}
      </div>
      <h3 className="font-serif text-2xl text-white mb-3">{title}</h3>
      <p className="text-sm text-white/45 leading-relaxed">{description}</p>
      <Link
        href={href}
        className="inline-flex items-center gap-1 mt-6 text-[10px] uppercase tracking-[0.16em] text-jpm-gold/60 hover:text-jpm-gold transition-colors"
      >
        Explore <span>→</span>
      </Link>
    </motion.article>
  );
}

function FloatingElement({ symbol, style, delay, duration, size, blur, zIndex = "z-0" }: {
  symbol: string; style: React.CSSProperties; delay: number; duration: number; size: string; blur: string; zIndex?: string;
}) {
  return (
    <motion.div
      className={`absolute ${size} ${blur} ${zIndex} font-serif text-jpm-gold/15 select-none`}
      style={style}
      animate={{ y: [0, -45, 0], rotate: [0, 12, -10, 0], opacity: [0.08, 0.28, 0.08], scale: [1, 1.08, 1] }}
      transition={{ duration, repeat: Infinity, delay, ease: "easeInOut" }}
    >
      {symbol}
    </motion.div>
  );
}

function FloatingBar({ style, delay, duration, rotate, zIndex = "z-0" }: {
  style: React.CSSProperties; delay: number; duration: number; rotate: number; zIndex?: string;
}) {
  return (
    <motion.div
      className={`absolute w-24 h-5 rounded-sm bg-gradient-to-r from-jpm-gold-dark via-jpm-gold to-jpm-gold-light shadow-[0_10px_24px_rgba(212,175,55,0.15)] select-none ${zIndex} opacity-15 border border-jpm-gold-light/20`}
      style={{ ...style, transform: `rotate(${rotate}deg)` }}
      animate={{ y: [0, -55, 0], rotateX: [0, 22, 0], rotateY: [0, 28, 0] }}
      transition={{ duration, repeat: Infinity, delay, ease: "easeInOut" }}
    >
      <div className="absolute inset-0 border-t border-l border-white/30 rounded-sm" />
      <div className="absolute inset-x-2 top-1 bottom-1 bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-sm" />
    </motion.div>
  );
}

function PlayIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="text-jpm-gold translate-x-0.5">
      <path d="M5 3l14 9-14 9V3z" />
    </svg>
  );
}

// ─── SVG Icons ────────────────────────────────────────────────────────────────
function WebinarIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function AlgoIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}

function UniversityIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
  );
}

// Unused — defined to satisfy AnimatePresence import (used in future mobile sheet enhancement)
export { AnimatePresence };
