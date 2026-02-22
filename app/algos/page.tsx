import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { listAlgos } from "@/lib/data/platform";

export const metadata = buildMetadata({
  title: "Algorithm Marketplace",
  description:
    "Institutional algorithm licensing marketplace with risk classification, monthly ROI context, and compliance disclosures.",
  path: "/algos",
});

export default async function AlgosPage() {
  const algos = await listAlgos();

  return (
    <main className="min-h-screen bg-jpm-cream pt-28 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <p className="text-xs uppercase tracking-[0.2em] text-jpm-gold mb-2">
          License Engine
        </p>
        <h1 className="font-serif text-4xl md:text-5xl text-jpm-navy">
          Institutional Algorithms
        </h1>
        <p className="mt-5 text-sm text-jpm-muted max-w-3xl">
          Strategy access is structured through controlled licensing with
          transparent risk descriptors, performance context, and server-side
          entitlement validation.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          {algos.map((algo) => (
            <article key={algo.id} className="card p-7 flex flex-col">
              <p className="text-xs uppercase tracking-[0.14em] text-jpm-gold mb-2">
                {algo.riskClass} Risk
              </p>
              <h2 className="font-serif text-2xl text-jpm-navy">{algo.name}</h2>
              <p className="mt-3 text-sm text-jpm-muted leading-relaxed flex-1">
                {algo.description}
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
                <div className="bg-jpm-ivory p-3 rounded-sm">
                  <p className="text-jpm-muted text-xs uppercase tracking-[0.1em]">
                    Monthly ROI
                  </p>
                  <p className="text-jpm-navy font-semibold">{algo.monthlyRoi.toFixed(2)}%</p>
                </div>
                <div className="bg-jpm-ivory p-3 rounded-sm">
                  <p className="text-jpm-muted text-xs uppercase tracking-[0.1em]">
                    Min Capital
                  </p>
                  <p className="text-jpm-navy font-semibold">
                    ${algo.minCapital.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <p className="font-serif text-2xl text-jpm-navy">${algo.price.toLocaleString()}</p>
                <Link href={`/algos/${algo.slug}`} className="btn-primary">
                  View
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
