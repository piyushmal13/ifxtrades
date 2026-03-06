"use client";
import Link from "next/link";
import Image from "next/image";
import {
  motion,
  useInView,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";

/* ── Animation helpers ────────────────────────────────────────────────────── */
const G = [0.25, 0.46, 0.45, 0.94] as const; // gravity easing

const fadeUp = {
  hidden: { opacity: 0, y: 32, filter: "blur(6px)" },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: G, delay: i * 0.08 },
  }),
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
};

/* ── Types ────────────────────────────────────────────────────────────────── */
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

/* ── Animated number counter ──────────────────────────────────────────────── */
function Counter({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { damping: 50, stiffness: 80 });
  const display = useTransform(spring, (v) =>
    `${prefix}${v.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}${suffix}`
  );
  useEffect(() => {
    if (inView) mv.set(value);
  }, [inView, mv, value]);
  return <motion.span ref={ref}>{display}</motion.span>;
}

/* ══════════════════════════════════════════════════════════════════════════ */
/*  ROOT                                                                      */
/* ══════════════════════════════════════════════════════════════════════════ */
export default function HomePageClient({
  posts,
  reviews,
}: {
  posts: Post[];
  reviews: Review[];
}) {
  return (
    <main
      className="min-h-screen overflow-x-hidden selection:bg-[#C9A84C] selection:text-[#080C14]"
      style={{ background: "#080C14", color: "#F0EDE8" }}
    >
      <Hero />
      <TrustBar />
      <Features />
      <Stats />
      {posts.length > 0 && <Research posts={posts} />}
      {reviews.length > 0 && <Reviews reviews={reviews} />}
      <FinalCTA />
    </main>
  );
}

/* ══════════════════════════════════════════════════════════════════════════ */
/*  HERO                                                                      */
/* ══════════════════════════════════════════════════════════════════════════ */
const HEADLINE = ["Institutional", "Capital", "Intelligence"];
const HEADLINE2 = ["Built for", "the Few."];

function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* ── Backgrounds ── */}
      <div className="absolute inset-0" style={{ background: "#080C14" }} />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 120% 80% at 50% -10%, rgba(201,168,76,0.13) 0%, transparent 60%)",
        }}
      />
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: "rgba(201,168,76,0.15)" }}
      />

      {/* ── Floating currency symbols ── */}
      {[
        { sym: "$", top: "14%", left: "5%", size: 72, delay: 0, dur: 16 },
        { sym: "€", top: "20%", right: "8%", size: 56, delay: 1.5, dur: 14 },
        { sym: "¥", top: "65%", left: "3%", size: 48, delay: 0.8, dur: 18 },
        { sym: "£", top: "70%", right: "6%", size: 52, delay: 2.2, dur: 15 },
        { sym: "₿", top: "40%", left: "1.5%", size: 32, delay: 1, dur: 20 },
      ].map(({ sym, top, left, right, size, delay, dur }) => (
        <motion.span
          key={sym}
          className="absolute select-none pointer-events-none font-serif font-bold"
          style={{
            top,
            left,
            right,
            fontSize: size,
            color: "rgba(201,168,76,0.06)",
            lineHeight: 1,
          }}
          animate={{ y: [0, -18, 0] }}
          transition={{ duration: dur, delay, repeat: Infinity, ease: "easeInOut" }}
        >
          {sym}
        </motion.span>
      ))}

      {/* ── Content ── */}
      <div className="relative z-10 w-full max-w-[1280px] mx-auto px-6 md:px-12 py-32 lg:py-40">
        <motion.div variants={stagger} initial="hidden" animate="visible">
          {/* Live badge */}
          <motion.div
            variants={fadeUp}
            custom={0}
            className="inline-flex items-center gap-3 rounded-full mb-10 px-5 py-2.5"
            style={{
              border: "1px solid rgba(201,168,76,0.3)",
              background: "rgba(201,168,76,0.05)",
            }}
          >
            <span className="relative flex h-2 w-2">
              <span
                className="animate-ping absolute inline-flex h-full w-full rounded-full"
                style={{ background: "#C9A84C" }}
              />
              <span
                className="relative inline-flex rounded-full h-2 w-2"
                style={{ background: "#C9A84C" }}
              />
            </span>
            <span
              className="text-[10px] uppercase tracking-[0.3em] font-semibold"
              style={{ color: "#C9A84C" }}
            >
              Institutional Capital Intelligence
            </span>
          </motion.div>

          {/* Headline — word by word */}
          <h1 className="font-serif leading-[0.95] tracking-[-0.025em] mb-6"
            style={{ fontSize: "clamp(52px, 8.5vw, 112px)" }}>
            {HEADLINE.map((w, i) => (
              <motion.span
                key={w}
                variants={fadeUp}
                custom={i + 1}
                className="block"
                style={{ color: i < 2 ? "#F0EDE8" : "#C9A84C" }}
              >
                {w}
              </motion.span>
            ))}
          </h1>

          <h2 className="font-serif italic leading-none tracking-[-0.01em] mb-10"
            style={{ fontSize: "clamp(28px, 4vw, 52px)", color: "rgba(240,237,232,0.4)" }}>
            {HEADLINE2.map((w, i) => (
              <motion.span key={w} variants={fadeUp} custom={i + 4} className="block">
                {w}
              </motion.span>
            ))}
          </h2>

          <motion.p
            variants={fadeUp}
            custom={6}
            className="text-base md:text-lg leading-relaxed max-w-[540px] mb-12"
            style={{ color: "#8A95A3" }}
          >
            IFXTrades delivers macro research, licensed algorithmic systems, and
            institutional-grade execution education — in one uncompromising environment.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={fadeUp} custom={7} className="flex flex-wrap gap-4">
            <Link
              href="/signup"
              className="relative overflow-hidden rounded-xl font-bold text-sm uppercase tracking-[0.12em] transition-all"
              style={{
                padding: "16px 36px",
                background: "linear-gradient(135deg, #8B6914 0%, #C9A84C 55%, #E6C97A 100%)",
                color: "#080C14",
              }}
            >
              <motion.span
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)",
                  backgroundSize: "200%",
                }}
                initial={{ backgroundPosition: "-200% 0" }}
                whileHover={{ backgroundPosition: "200% 0" }}
                transition={{ duration: 0.9 }}
              />
              <span className="relative">Request Institutional Access →</span>
            </Link>
            <Link
              href="/webinars"
              className="group rounded-xl font-semibold text-sm uppercase tracking-[0.12em] transition-all flex items-center gap-2"
              style={{
                padding: "16px 28px",
                border: "1px solid rgba(201,168,76,0.3)",
                color: "rgba(240,237,232,0.6)",
              }}
              onMouseEnter={(e) =>
              ((e.currentTarget as HTMLAnchorElement).style.borderColor =
                "rgba(201,168,76,0.7)")
              }
              onMouseLeave={(e) =>
              ((e.currentTarget as HTMLAnchorElement).style.borderColor =
                "rgba(201,168,76,0.3)")
              }
            >
              <span>View Intelligence</span>
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </motion.div>

          {/* Trust micro-line */}
          <motion.div
            variants={fadeUp}
            custom={8}
            className="mt-16 flex flex-wrap items-center gap-6"
          >
            {["ISO 27001", "FCA Aligned", "AML/KYC", "256-bit SSL"].map((t) => (
              <span
                key={t}
                className="text-[10px] uppercase tracking-[0.22em]"
                style={{ color: "#4A5568" }}
              >
                {t}
              </span>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* ── Scroll cue ── */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <div
          className="w-px h-14"
          style={{
            background:
              "linear-gradient(to bottom, transparent, rgba(201,168,76,0.5), transparent)",
          }}
        />
        <span
          className="text-[9px] tracking-[0.35em] uppercase"
          style={{ color: "rgba(201,168,76,0.35)" }}
        >
          scroll
        </span>
      </motion.div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════════════ */
/*  TRUST BAR                                                                 */
/* ══════════════════════════════════════════════════════════════════════════ */
const TRUST = [
  { icon: "🔐", label: "256-Bit SSL" },
  { icon: "🛡", label: "ISO 27001" },
  { icon: "📋", label: "KYC / AML" },
  { icon: "🔍", label: "Audit Logs" },
  { icon: "⚡", label: "99.9% Uptime" },
];

function TrustBar() {
  return (
    <div
      className="py-4 overflow-hidden"
      style={{
        borderTop: "1px solid rgba(255,255,255,0.05)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        background: "#0D1421",
      }}
    >
      <div className="max-w-[1280px] mx-auto px-6 flex flex-wrap items-center justify-between gap-4">
        {TRUST.map((t) => (
          <div key={t.label} className="flex items-center gap-2">
            <span className="text-sm">{t.icon}</span>
            <span
              className="text-[10px] uppercase tracking-[0.22em] font-medium"
              style={{ color: "#8A95A3" }}
            >
              {t.label}
            </span>
          </div>
        ))}
        <div className="flex items-center gap-2">
          <span
            className="inline-block w-2 h-2 rounded-full animate-pulse"
            style={{ background: "#22C55E" }}
          />
          <span
            className="text-[10px] uppercase tracking-[0.22em] font-semibold"
            style={{ color: "#22C55E" }}
          >
            All Systems Live
          </span>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════ */
/*  FEATURES GRID                                                             */
/* ══════════════════════════════════════════════════════════════════════════ */
const FEATURES = [
  {
    icon: "📡",
    title: "Macro Intelligence",
    desc: "Institutional-grade research on FX macro flows, central bank policy, and cross-asset positioning. Updated weekly by our research desk.",
    href: "/blog",
    cta: "Open Research",
  },
  {
    icon: "⚙️",
    title: "Algorithm Licensing",
    desc: "Deploy institutional-grade algorithms under a transparent licensing framework. Track performance, manage SLAs, and operate with full audit trails.",
    href: "/algorithms",
    cta: "Explore Algos",
  },
  {
    icon: "🎓",
    title: "Institutional Academy",
    desc: "Structured educational content on execution dynamics, risk frameworks, and institutional order flow — built for practitioners, not retail.",
    href: "/university",
    cta: "Access Academy",
  },
  {
    icon: "📅",
    title: "Exclusive Webinars",
    desc: "Curated sessions with capacity controls, seat governance, and live Q&A. Only verified institutional participants may register.",
    href: "/webinars",
    cta: "View Calendar",
  },
  {
    icon: "🌐",
    title: "Market Intelligence",
    desc: "Live market context, cross-pair correlations, and real-time execution insights aggregated from multiple institutional data sources.",
    href: "/market",
    cta: "Live Feed",
  },
  {
    icon: "🔒",
    title: "Verified Access",
    desc: "A gated, identity-verified environment. Every participant is authenticated through a multi-layer onboarding process before gaining full access.",
    href: "/signup",
    cta: "Apply Now",
  },
];

function FeatureCard({
  f,
  index,
}: {
  f: (typeof FEATURES)[number];
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      variants={fadeUp}
      custom={index}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className="group relative p-8 rounded-2xl flex flex-col transition-all duration-500"
      style={{
        background: "rgba(13,20,33,0.6)",
        border: "1px solid rgba(255,255,255,0.06)",
        backdropFilter: "blur(12px)",
      }}
      whileHover={{
        borderColor: "rgba(201,168,76,0.5)",
        boxShadow: "0 16px 48px rgba(0,0,0,0.5), 0 0 30px rgba(201,168,76,0.08)",
        y: -4,
      }}
      transition={{ duration: 0.25 }}
    >
      {/* Gold top border on hover */}
      <div
        className="absolute inset-x-0 top-0 h-px rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(201,168,76,0.8), transparent)",
        }}
      />
      <div className="text-3xl mb-5">{f.icon}</div>
      <h3
        className="font-serif text-xl mb-3 leading-snug"
        style={{ color: "#F0EDE8" }}
      >
        {f.title}
      </h3>
      <p
        className="text-sm leading-relaxed mb-6 flex-1"
        style={{ color: "#8A95A3" }}
      >
        {f.desc}
      </p>
      <Link
        href={f.href}
        className="text-[11px] uppercase tracking-[0.2em] font-semibold flex items-center gap-2 transition-all group-hover:gap-3"
        style={{ color: "#C9A84C" }}
      >
        {f.cta}
        <span className="transition-transform group-hover:translate-x-1">→</span>
      </Link>
    </motion.div>
  );
}

function Features() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      ref={ref}
      className="py-28 px-6 md:px-12"
      style={{ background: "#080C14" }}
    >
      <div className="max-w-[1280px] mx-auto">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="mb-16"
        >
          <p
            className="text-[10px] uppercase tracking-[0.3em] mb-4"
            style={{ color: "#C9A84C" }}
          >
            The Architecture
          </p>
          <h2
            className="font-serif leading-tight tracking-[-0.02em]"
            style={{ fontSize: "clamp(36px, 4.5vw, 64px)", color: "#F0EDE8" }}
          >
            Everything You Need.<br />
            <span style={{ color: "rgba(240,237,232,0.35)" }}>Nothing You Don't.</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <FeatureCard key={f.title} f={f} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════════════ */
/*  STATS                                                                     */
/* ══════════════════════════════════════════════════════════════════════════ */
const STATS = [
  { value: 2400, suffix: "+", label: "Verified Members", prefix: "" },
  { value: 847, suffix: "M+", label: "Volume Tracked", prefix: "$", decimals: 0 },
  { value: 94.2, suffix: "%", label: "Signal Accuracy", prefix: "", decimals: 1 },
  { value: 156, suffix: "+", label: "Global Partners", prefix: "" },
];

function Stats() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      className="py-20 px-6 md:px-12"
      style={{
        background: "#0D1421",
        borderTop: "1px solid rgba(255,255,255,0.05)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <div className="max-w-[1280px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-10">
        {STATS.map((s, i) => (
          <motion.div
            key={s.label}
            variants={fadeUp}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            custom={i}
            className="text-center"
          >
            <div
              className="font-serif font-bold mb-2"
              style={{ fontSize: "clamp(40px, 4.5vw, 64px)", color: "#C9A84C" }}
            >
              {inView ? (
                <Counter
                  value={s.value}
                  prefix={s.prefix}
                  suffix={s.suffix}
                  decimals={s.decimals ?? 0}
                />
              ) : (
                `${s.prefix}0${s.suffix}`
              )}
            </div>
            <div
              className="text-[11px] uppercase tracking-[0.2em]"
              style={{ color: "#4A5568" }}
            >
              {s.label}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════════════ */
/*  RESEARCH PREVIEW                                                          */
/* ══════════════════════════════════════════════════════════════════════════ */
function Research({ posts }: { posts: Post[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const visible = posts.slice(0, 3);

  return (
    <section ref={ref} className="py-28 px-6 md:px-12" style={{ background: "#080C14" }}>
      <div className="max-w-[1280px] mx-auto">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="flex items-end justify-between mb-12"
        >
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] mb-3" style={{ color: "#C9A84C" }}>
              Intelligence Brief
            </p>
            <h2 className="font-serif" style={{ fontSize: "clamp(28px, 3.5vw, 48px)", color: "#F0EDE8" }}>
              Latest Research
            </h2>
          </div>
          <Link
            href="/blog"
            className="hidden sm:flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] font-semibold transition-all"
            style={{ color: "#C9A84C" }}
          >
            All Research →
          </Link>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {visible.map((p, i) => (
            <motion.div
              key={p.id}
              variants={fadeUp}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              custom={i}
            >
              <Link href={`/blog/${p.slug}`} className="block group">
                <article
                  className="rounded-xl p-6 h-full transition-all duration-300"
                  style={{
                    background: "rgba(13,20,33,0.6)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <p className="text-[10px] uppercase tracking-[0.2em] mb-3 font-medium" style={{ color: "#C9A84C" }}>
                    {p.category}
                  </p>
                  <h3
                    className="font-serif text-lg leading-snug mb-3 group-hover:text-[#C9A84C] transition-colors"
                    style={{ color: "#F0EDE8" }}
                  >
                    {p.title}
                  </h3>
                  <p className="text-sm leading-relaxed line-clamp-3" style={{ color: "#8A95A3" }}>
                    {p.excerpt ?? p.body.slice(0, 160)}
                  </p>
                </article>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════════════ */
/*  REVIEWS                                                                   */
/* ══════════════════════════════════════════════════════════════════════════ */
function Reviews({ reviews }: { reviews: Review[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  return (
    <section ref={ref} className="py-24 px-6 md:px-12" style={{ background: "#0D1421" }}>
      <div className="max-w-[1280px] mx-auto">
        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="text-center text-[10px] uppercase tracking-[0.3em] mb-12"
          style={{ color: "#C9A84C" }}
        >
          Institutional Testimonials
        </motion.p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {reviews.slice(0, 3).map((r, i) => (
            <motion.div
              key={r.id}
              variants={fadeUp}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              custom={i}
              className="rounded-xl p-6"
              style={{
                background: "rgba(13,20,33,0.6)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <p className="text-sm leading-relaxed mb-6 italic" style={{ color: "#8A95A3" }}>
                &ldquo;{r.quote}&rdquo;
              </p>
              <p className="text-[11px] uppercase tracking-[0.2em] font-semibold" style={{ color: "#C9A84C" }}>
                {r.companyName}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════════════ */
/*  FINAL CTA                                                                 */
/* ══════════════════════════════════════════════════════════════════════════ */
function FinalCTA() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  return (
    <section
      ref={ref}
      className="py-32 px-6 md:px-12 text-center relative overflow-hidden"
      style={{ background: "#080C14" }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(201,168,76,0.07), transparent 70%)",
        }}
      />
      <div className="relative z-10 max-w-3xl mx-auto">
        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="text-[10px] uppercase tracking-[0.3em] mb-6"
          style={{ color: "#C9A84C" }}
        >
          Begin Your Institutional Journey
        </motion.p>
        <motion.h2
          variants={fadeUp}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          custom={1}
          className="font-serif leading-tight tracking-[-0.02em] mb-6"
          style={{ fontSize: "clamp(40px, 5.5vw, 80px)", color: "#F0EDE8" }}
        >
          The Edge You've<br />
          <span style={{ color: "#C9A84C" }}>Always Needed.</span>
        </motion.h2>
        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          custom={2}
          className="text-base md:text-lg leading-relaxed mb-12 mx-auto max-w-xl"
          style={{ color: "#8A95A3" }}
        >
          Join a verified network of institutional participants with access to
          proprietary research, licensed algorithms, and exclusive events.
        </motion.p>
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          custom={3}
          className="flex flex-wrap justify-center gap-4"
        >
          <Link
            href="/signup"
            className="relative overflow-hidden rounded-xl font-bold text-sm uppercase tracking-[0.12em] transition-all"
            style={{
              padding: "18px 44px",
              background: "linear-gradient(135deg, #8B6914 0%, #C9A84C 55%, #E6C97A 100%)",
              color: "#080C14",
            }}
          >
            <motion.span
              className="absolute inset-0"
              style={{
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                backgroundSize: "200%",
              }}
              initial={{ backgroundPosition: "-200% 0" }}
              whileHover={{ backgroundPosition: "200% 0" }}
              transition={{ duration: 0.9 }}
            />
            <span className="relative">Request Access Now →</span>
          </Link>
          <Link
            href="/webinars"
            className="rounded-xl font-semibold text-sm uppercase tracking-[0.12em] transition-all"
            style={{
              padding: "18px 32px",
              border: "1px solid rgba(201,168,76,0.3)",
              color: "rgba(240,237,232,0.6)",
            }}
          >
            Explore Events
          </Link>
        </motion.div>

        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          custom={4}
          className="mt-12 text-[10px] tracking-[0.2em] uppercase"
          style={{ color: "#4A5568" }}
        >
          Protected by IFXTrades Institutional Security · ISO 27001 · 256-bit SSL
        </motion.p>
      </div>
    </section>
  );
}
