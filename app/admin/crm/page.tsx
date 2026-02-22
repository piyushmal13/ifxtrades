import { getAdminSummary, listCrmUsers } from "@/lib/data/platform";

export default async function AdminCrmPage() {
  const [summary, users] = await Promise.all([getAdminSummary(), listCrmUsers(200)]);

  return (
    <div>
      <p className="text-xs uppercase tracking-[0.2em] text-jpm-gold mb-2">CRM</p>
      <h1 className="font-serif text-4xl text-jpm-navy">User and Revenue Operations</h1>
      <p className="mt-4 text-sm text-jpm-muted max-w-3xl">
        Export-ready operational data for user lifecycle, payment flow, and
        license management.
      </p>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 mt-8">
        <Kpi label="Total Users" value={summary.totalUsers} />
        <Kpi label="Webinar Registrations" value={summary.webinarRegistrations} />
        <Kpi label="Revenue (USD)" value={Math.round(summary.revenueUsd)} />
      </div>

      <div className="flex flex-wrap gap-3 mt-6">
        <a href="/api/admin/crm/export?type=users" className="btn-outline">
          Export Users CSV
        </a>
        <a href="/api/admin/crm/export?type=licenses" className="btn-outline">
          Export Licenses CSV
        </a>
        <a href="/api/admin/crm/export?type=payments" className="btn-outline">
          Export Payments CSV
        </a>
      </div>

      <div className="card mt-8 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-jpm-border text-left">
              <th className="p-4">Email</th>
              <th className="p-4">Role</th>
              <th className="p-4">Created</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-jpm-border/70">
                <td className="p-4">{user.email}</td>
                <td className="p-4 uppercase">{user.role}</td>
                <td className="p-4">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
