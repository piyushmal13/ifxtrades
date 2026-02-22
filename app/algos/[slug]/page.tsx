import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAlgoBySlug } from "@/lib/data/platform";
import { buildMetadata, productJsonLd } from "@/lib/seo";

type Params = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const algo = await getAlgoBySlug(slug);
  if (!algo) {
    return buildMetadata({
      title: "Algorithm Not Found",
      description: "Algorithm not available.",
      path: `/algos/${slug}`,
    });
  }

  return buildMetadata({
    title: algo.name,
    description: algo.description.slice(0, 150),
    path: `/algos/${algo.slug}`,
  });
}

export default async function AlgoDetailPage({ params }: Params) {
  const { slug } = await params;
  const algo = await getAlgoBySlug(slug);

  if (!algo) {
    notFound();
  }

  const jsonLd = productJsonLd({
    name: algo.name,
    description: algo.description,
    url: `https://www.ifxtrades.com/algos/${algo.slug}`,
    price: algo.price,
    image: algo.imageUrl,
  });

  return (
    <main className="min-h-screen bg-jpm-cream pt-28 pb-20 px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-6xl mx-auto">
        <p className="text-xs uppercase tracking-[0.2em] text-jpm-gold mb-2">
          Strategy Detail
        </p>
        <h1 className="font-serif text-4xl md:text-5xl text-jpm-navy">{algo.name}</h1>
        <p className="mt-6 text-sm text-jpm-muted leading-relaxed max-w-4xl">
          {algo.description}
        </p>

        <div className="grid md:grid-cols-3 gap-4 mt-10">
          <Metric label="Risk Class" value={algo.riskClass} />
          <Metric label="Monthly ROI" value={`${algo.monthlyRoi.toFixed(2)}%`} />
          <Metric label="Minimum Capital" value={`$${algo.minCapital.toLocaleString()}`} />
        </div>

        <div className="card p-8 mt-8">
          <p className="text-xs uppercase tracking-[0.14em] text-jpm-gold mb-3">
            Compliance Disclaimer
          </p>
          <p className="text-sm text-jpm-muted leading-relaxed">{algo.complianceDisclaimer}</p>
          <p className="mt-6 font-serif text-3xl text-jpm-navy">
            ${algo.price.toLocaleString()}
          </p>
          <p className="mt-2 text-xs text-jpm-muted uppercase tracking-[0.12em]">
            License fee
          </p>
        </div>

        <section className="mt-10">
          <h2 className="font-serif text-2xl text-jpm-navy mb-4">
            Performance Snapshots
          </h2>
          {algo.snapshots.length === 0 ? (
            <p className="text-sm text-jpm-muted">
              Performance data will be published by the research team.
            </p>
          ) : (
            <div className="overflow-x-auto card">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-jpm-border text-left">
                    <th className="p-4">Period</th>
                    <th className="p-4">ROI</th>
                    <th className="p-4">Drawdown</th>
                  </tr>
                </thead>
                <tbody>
                  {algo.snapshots.map((snapshot) => (
                    <tr key={snapshot.id} className="border-b border-jpm-border/60">
                      <td className="p-4">
                        {snapshot.periodStart} to {snapshot.periodEnd}
                      </td>
                      <td className="p-4">{snapshot.roiPct.toFixed(2)}%</td>
                      <td className="p-4">{snapshot.drawdownPct.toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-5">
      <p className="text-xs uppercase tracking-[0.14em] text-jpm-muted">{label}</p>
      <p className="mt-2 text-lg font-semibold text-jpm-navy">{value}</p>
    </div>
  );
}
