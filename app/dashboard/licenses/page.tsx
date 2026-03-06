export const dynamic = "force-dynamic";

import { requireUser } from "@/lib/auth";
import { getUserLicenses } from "@/lib/data/platform";

export default async function DashboardLicensesPage() {
  const { user } = await requireUser("/dashboard/licenses");
  const licenses = await getUserLicenses(user.id);

  return (
    <div className="text-white">
      <p className="text-[10px] uppercase tracking-[0.2em] text-ifx-gold mb-2">Licenses</p>
      <h1 className="font-serif text-4xl">Algorithm Licenses</h1>
      <p className="mt-4 text-sm text-white/45 max-w-2xl">
        License validity is enforced server-side and synchronized with expiry and
        entitlement checks.
      </p>

      {licenses.length === 0 ? (
        <p className="card p-6 mt-8 text-sm text-white/55">
          No active or historical licenses found for this account.
        </p>
      ) : (
        <div className="card border border-white/10 bg-white/3 mt-8 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-[10px] uppercase tracking-[0.15em] text-white/40">
                <th className="p-4">Algorithm</th>
                <th className="p-4">Status</th>
                <th className="p-4">Starts</th>
                <th className="p-4">Expires</th>
              </tr>
            </thead>
            <tbody>
              {licenses.map((license) => (
                <tr key={license.id} className="border-b border-white/5">
                  <td className="p-4">{license.algoName}</td>
                  <td className="p-4 uppercase text-ifx-gold">{license.status}</td>
                  <td className="p-4 text-white/70">
                    {license.startsAt
                      ? new Date(license.startsAt).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="p-4 text-white/70">
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
