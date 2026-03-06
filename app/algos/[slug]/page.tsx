import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
import { getAlgoBySlug } from "@/lib/data/platform";
import { buildMetadata, productJsonLd } from "@/lib/seo";
import BuyLicenseButton from "@/components/algos/BuyLicenseButton";

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
    <main className="min-h-screen bg-[#020617] pt-28 pb-20 px-6 text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Background glow */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_0%,rgba(212,175,55,0.06),transparent)] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        <p className="text-[10px] uppercase tracking-[0.28em] text-ifx-gold/70 mb-3">
          Strategy Engine
        </p>
        <h1 className="font-serif text-4xl md:text-5xl text-white tracking-[-0.01em]">{algo.name}</h1>
        <p className="mt-6 text-sm text-white/50 leading-relaxed max-w-4xl">
          {algo.description}
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-10">
          <Metric label="Risk Classification" value={algo.riskClass} />
          <Metric label="Baseline ROI" value={`${algo.monthlyRoi.toFixed(2)}%`} />
          <Metric label="Min Deployment" value={`$${algo.minCapital.toLocaleString()}`} />
        </div>

        <div className="card border border-white/10 bg-white/3 backdrop-blur-md p-8 mt-8">
          <p className="text-[10px] uppercase tracking-[0.14em] text-ifx-gold/80 mb-3">
            Institutional Compliance & Risk Disclosure
          </p>
          <p className="text-sm text-white/45 leading-relaxed italic">{algo.complianceDisclaimer}</p>

          <div className="mt-8 pt-8 border-t border-white/10 flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-[10px] uppercase tracking-[0.12em] text-white/30 mb-1">
                Annual License Fee
              </p>
              <p className="font-serif text-4xl text-white tracking-tight">
                ${algo.price.toLocaleString()}
              </p>
            </div>
            <BuyLicenseButton algoId={algo.id} algoSlug={algo.slug} price={algo.price} />
          </div>
        </div>

        <section className="mt-12">
          <h2 className="font-serif text-2xl text-white mb-6">
            Performance Snapshots
          </h2>
          {algo.snapshots.length === 0 ? (
            <div className="card border border-white/10 bg-white/3 backdrop-blur-md p-8 text-center">
              <p className="text-sm text-white/30 italic">
                Verified performance data is currently being audited by the research team.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden card border border-white/10 bg-white/3 backdrop-blur-md">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-left text-[10px] uppercase tracking-[0.2em] text-white/30">
                      <th className="p-5 font-semibold">Audit Period</th>
                      <th className="p-5 font-semibold">Realized ROI</th>
                      <th className="p-5 font-semibold">Max Drawdown</th>
                    </tr>
                  </thead>
                  <tbody>
                    {algo.snapshots.map((snapshot) => (
                      <tr key={snapshot.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                        <td className="p-5 text-white/70">
                          {snapshot.periodStart} to {snapshot.periodEnd}
                        </td>
                        <td className="p-5 text-emerald-400 font-medium font-serif">+{snapshot.roiPct.toFixed(2)}%</td>
                        <td className="p-5 text-red-400 font-medium font-serif">-{snapshot.drawdownPct.toFixed(2)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="card border border-white/10 bg-white/3 backdrop-blur-md p-5">
      <p className="text-[10px] uppercase tracking-[0.18em] text-white/30">{label}</p>
      <p className="mt-2 font-serif text-xl text-white tracking-tight">{value}</p>
    </div>
  );
}
