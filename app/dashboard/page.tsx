import { getDashboardSummary } from "@/lib/data/platform";
import { requireUser } from "@/lib/auth";

export default async function DashboardPage() {
  const { user } = await requireUser("/dashboard");
  const summary = await getDashboardSummary(user.id);

  return (
    <div>
      <p className="text-xs uppercase tracking-[0.2em] text-jpm-gold mb-2">Overview</p>
      <h1 className="font-serif text-4xl text-jpm-navy">Your Dashboard</h1>
      <p className="mt-4 text-sm text-jpm-muted max-w-2xl">
        Monitor webinar engagement, algorithm license status, and learning
        progress from a single operational view.
      </p>

      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4 mt-8">
        <Kpi label="Webinar Registrations" value={summary.webinarRegistrations} />
        <Kpi label="Active Licenses" value={summary.activeLicenses} />
        <Kpi label="Completed Lessons" value={summary.completedLessons} />
        <Kpi label="Tracked Lessons" value={summary.totalLessonsTracked} />
      </div>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: number }) {
  return (
    <article className="card p-5">
      <p className="text-xs uppercase tracking-[0.14em] text-jpm-muted">{label}</p>
      <p className="mt-2 font-serif text-3xl text-jpm-navy">{value}</p>
    </article>
  );
}
