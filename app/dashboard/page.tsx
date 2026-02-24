export const dynamic = "force-dynamic";
import { getDashboardSummary } from "@/lib/data/platform";
import { requireVerified } from "@/lib/auth";
import Link from "next/link";

export default async function DashboardPage() {
  const { user } = await requireVerified("/dashboard");
  const summary = await getDashboardSummary(user.id);

  return (
    <div className="text-white">
      <p className="text-[10px] uppercase tracking-[0.28em] text-jpm-gold/70 mb-3">Your Account</p>
      <h1 className="font-serif text-4xl md:text-5xl text-white tracking-[-0.01em]">Dashboard</h1>
      <p className="mt-4 text-sm text-white/45 max-w-2xl leading-relaxed">
        Monitor webinar engagement, algorithm license status, and learning progress from a single operational view.
      </p>

      {/* KPI row */}
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4 mt-10">
        <Kpi label="Webinar Registrations" value={summary.webinarRegistrations} icon="📡" color="text-sky-400" />
        <Kpi label="Active Licenses" value={summary.activeLicenses} icon="⚡" color="text-jpm-gold" />
        <Kpi label="Completed Lessons" value={summary.completedLessons} icon="✓" color="text-emerald-400" />
        <Kpi label="Tracked Lessons" value={summary.totalLessonsTracked} icon="📚" color="text-white/60" />
      </div>

      {/* Progress to completion */}
      <div className="mt-8 card border border-white/8 bg-white/3 p-6">
        <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-3">Course Completion</p>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-white/60">
            {summary.completedLessons} / {summary.totalLessonsTracked} lessons completed
          </span>
          <span className="text-sm text-emerald-400 font-semibold">
            {summary.totalLessonsTracked > 0
              ? Math.round((summary.completedLessons / summary.totalLessonsTracked) * 100)
              : 0}%
          </span>
        </div>
        <div className="h-1.5 w-full bg-white/8 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-700"
            style={{
              width: summary.totalLessonsTracked > 0
                ? `${(summary.completedLessons / summary.totalLessonsTracked) * 100}%`
                : "0%",
            }}
          />
        </div>
      </div>

      {/* Quick links */}
      <div className="mt-6 grid md:grid-cols-3 gap-4">
        {[
          { label: "Browse Webinars", href: "/webinars", desc: "Register for upcoming events" },
          { label: "Algorithm Catalog", href: "/algos", desc: "License institutional strategies" },
          { label: "University", href: "/university", desc: "Continue your learning path" },
        ].map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="card border border-white/8 bg-white/3 p-5 hover:border-jpm-gold/35 hover:-translate-y-0.5 transition-all duration-300 group"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-jpm-gold group-hover:text-white transition-colors">
              {link.label} →
            </p>
            <p className="mt-1.5 text-xs text-white/35">{link.desc}</p>
          </a>
        ))}
      </div>
    </div>
  );
}

function Kpi({ label, value, icon, color }: { label: string; value: number; icon: string; color: string }) {
  return (
    <article className="card relative overflow-hidden border border-white/8 bg-white/3 p-6 group hover:border-jpm-gold/25 transition-all duration-300">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(212,175,55,0.04),_transparent_60%)]" />
      <div className="flex items-start justify-between mb-3">
        <p className="text-[9px] uppercase tracking-[0.2em] text-white/35">{label}</p>
        <span className="text-lg opacity-60">{icon}</span>
      </div>
      <p className={`mt-1 font-serif text-4xl font-medium ${color}`}>{value}</p>
    </article>
  );
}
