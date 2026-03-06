export const dynamic = "force-dynamic";
import CrudManager from "@/components/admin/CrudManager";
import { listAlgoSnapshots, listAlgos } from "@/lib/data/platform";

export default async function AdminAlgoSnapshotsPage() {
  const [snapshotRows, algos] = await Promise.all([
    listAlgoSnapshots(),
    listAlgos({ includeInactive: true }),
  ]);
  const algoNameById = new Map(algos.map((algo) => [algo.id, algo.name]));

  return (
    <CrudManager
      title="Algo Snapshots"
      description="Manage monthly performance snapshots used on strategy detail pages."
      endpoint="/api/admin/algo-snapshots"
      fields={[
        {
          name: "algo_id",
          label: "Algorithm",
          type: "select",
          required: true,
          options: algos.map((algo) => ({ label: algo.name, value: algo.id })),
        },
        { name: "period_start", label: "Period Start", type: "date" },
        { name: "period_end", label: "Period End", type: "date" },
        { name: "roi_pct", label: "ROI (%)", type: "number", required: true },
        { name: "drawdown_pct", label: "Drawdown (%)", type: "number", required: true },
      ]}
      rows={snapshotRows.map((row) => ({
        ...row,
        algo_name: algoNameById.get(row.algo_id) ?? row.algo_id,
      }))}
      columns={[
        { key: "algo_name", label: "Algorithm" },
        { key: "period_start", label: "Start" },
        { key: "period_end", label: "End" },
        { key: "roi_pct", label: "ROI" },
        { key: "drawdown_pct", label: "Drawdown" },
      ]}
    />
  );
}
