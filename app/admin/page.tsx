import { getAdminSummary } from "@/lib/data/platform";

export default async function AdminHomePage() {
  const summary = await getAdminSummary();

  return (
    <div>
      <p className="text-xs uppercase tracking-[0.2em] text-jpm-gold mb-2">Back Office</p>
      <h1 className="font-serif text-4xl text-jpm-navy">Enterprise Admin Overview</h1>
      <p className="mt-4 text-sm text-jpm-muted max-w-3xl">
        Operational control across user lifecycle, licensing, learning, and
        revenue workflows.
      </p>

      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4 mt-8">
        <Kpi label="Total Users" value={summary.totalUsers} />
        <Kpi label="Active Users" value={summary.activeUsers} />
        <Kpi label="Webinar Registrations" value={summary.webinarRegistrations} />
        <Kpi label="Algo Licenses Sold" value={summary.algoLicensesSold} />
        <Kpi label="Course Enrollments" value={summary.courseEnrollments} />
        <Kpi label="Expiring Licenses" value={summary.expiringLicenses} />
        <Kpi label="Revenue (USD)" value={Math.round(summary.revenueUsd)} />
      </div>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: number }) {
  return (
    <article className="card p-5">
      <p className="text-xs uppercase tracking-[0.14em] text-jpm-muted">{label}</p>
      <p className="mt-2 font-serif text-3xl text-jpm-navy">{value.toLocaleString()}</p>
    </article>
  );
}
