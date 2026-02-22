import { requireUser } from "@/lib/auth";
import { getUserLicenses } from "@/lib/data/platform";

export default async function DashboardLicensesPage() {
  const { user } = await requireUser("/dashboard/licenses");
  const licenses = await getUserLicenses(user.id);

  return (
    <div>
      <p className="text-xs uppercase tracking-[0.2em] text-jpm-gold mb-2">Licenses</p>
      <h1 className="font-serif text-4xl text-jpm-navy">Algorithm Licenses</h1>
      <p className="mt-4 text-sm text-jpm-muted max-w-2xl">
        License validity is enforced server-side and synchronized with expiry and
        entitlement checks.
      </p>

      {licenses.length === 0 ? (
        <p className="card p-6 mt-8 text-sm text-jpm-muted">
          No active or historical licenses found for this account.
        </p>
      ) : (
        <div className="card mt-8 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-jpm-border text-left">
                <th className="p-4">Algorithm</th>
                <th className="p-4">Status</th>
                <th className="p-4">Starts</th>
                <th className="p-4">Expires</th>
              </tr>
            </thead>
            <tbody>
              {licenses.map((license) => (
                <tr key={license.id} className="border-b border-jpm-border/70">
                  <td className="p-4">{license.algoName}</td>
                  <td className="p-4 uppercase">{license.status}</td>
                  <td className="p-4">
                    {license.startsAt
                      ? new Date(license.startsAt).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="p-4">
                    {license.expiresAt
                      ? new Date(license.expiresAt).toLocaleDateString()
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
