export const dynamic = "force-dynamic";
import { getAdminSummary } from "@/lib/data/platform";

export default async function AdminHomePage() {
  const summary = await getAdminSummary();

  const kpis = [
    { label: "Total Users", value: summary.totalUsers, icon: "👥", color: "#60a5fa" },
    { label: "Active Users", value: summary.activeUsers, icon: "⚡", color: "#34d399" },
    { label: "Webinar Registrations", value: summary.webinarRegistrations, icon: "📡", color: "#d4af37" },
    { label: "Algo Licenses Sold", value: summary.algoLicensesSold, icon: "🔐", color: "#d4af37" },
    { label: "Course Enrolments", value: summary.courseEnrollments, icon: "📚", color: "#a78bfa" },
    { label: "Expiring Licenses", value: summary.expiringLicenses, icon: "⏳", color: "#fbbf24" },
    { label: "Revenue (USD)", value: Math.round(summary.revenueUsd), icon: "💵", color: "#34d399", prefix: "$" },
  ] as const;

  return (
    <div>
      {/* Page header */}
      <div className="mb-8">
        <p className="text-[10px] uppercase tracking-[0.22em] mb-2" style={{ color: "var(--color-gold)" }}>
          Back Office
        </p>
        <h1 className="font-serif text-4xl" style={{ color: "var(--color-text-primary)" }}>
          Enterprise Overview
        </h1>
        <p className="mt-3 text-sm max-w-2xl leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
          Operational control across user lifecycle, licensing, learning, and revenue workflows.
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </div>

      {/* Quick actions row */}
      <div className="mt-8 grid sm:grid-cols-3 gap-4">
        {[
          { label: "Manage Users", href: "/admin/users", desc: "View, edit, suspend accounts" },
          { label: "Review Algorithms", href: "/admin/algos", desc: "Active listings and pricing" },
          { label: "Content Dashboard", href: "/admin/blog", desc: "Blog, webinars, university" },
        ].map((action) => (
          <a
            key={action.href}
            href={action.href}
            className="card p-5 group hover:-translate-y-0.5 transition-all duration-200"
            style={{
              borderColor: "var(--color-border)",
              textDecoration: "none",
            }}
          >
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors duration-150"
              style={{ color: "var(--color-gold)" }}
            >
              {action.label} →
            </p>
            <p className="mt-1.5 text-xs" style={{ color: "var(--color-text-muted)" }}>
              {action.desc}
            </p>
          </a>
        ))}
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  icon,
  color,
  prefix = "",
}: {
  label: string;
  value: number;
  icon: string;
  color: string;
  prefix?: string;
}) {
  return (
    <article
      className="card relative overflow-hidden p-6 group transition-all duration-200 hover:-translate-y-0.5"
      style={{ borderColor: "var(--color-border)" }}
    >
      {/* Subtle radial glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at top left, ${color}08, transparent 60%)`,
        }}
      />
      <div className="flex items-start justify-between mb-4">
        <p
          className="text-[10px] uppercase tracking-[0.18em]"
          style={{ color: "var(--color-text-muted)" }}
        >
          {label}
        </p>
        <span className="text-xl opacity-60">{icon}</span>
      </div>
      <p
        className="font-serif text-3xl font-medium"
        style={{ color }}
      >
        {prefix}{value.toLocaleString()}
      </p>
    </article>
  );
}
