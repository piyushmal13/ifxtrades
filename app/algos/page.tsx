export const dynamic = "force-dynamic";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { listAlgos, type AlgoSummary } from "@/lib/data/platform";

import { type Metadata } from "next";
export const metadata: Metadata = buildMetadata({
  title: "Algorithm Marketplace",
  description:
    "Institutional algorithm licensing marketplace with risk classification, monthly ROI context, and compliance disclosures.",
  path: "/algos",
});

const RISK_CONFIG: Record<string, { label: string; bar: string; text: string; badge: string }> = {
  LOW: { label: "Low Risk", bar: "bg-emerald-400", text: "text-emerald-400", badge: "border-emerald-400/30 bg-emerald-400/8 text-emerald-400" },
  MEDIUM: { label: "Medium Risk", bar: "bg-amber-400", text: "text-amber-400", badge: "border-amber-400/30 bg-amber-400/8 text-amber-400" },
  HIGH: { label: "High Risk", bar: "bg-red-400", text: "text-red-400", badge: "border-red-400/30 bg-red-400/8 text-red-400" },
};

function Sparkline({ color }: { color: string }) {
  // Simple fake institutional sparkline
  return (
    <svg width="60" height="24" viewBox="0 0 60 24" fill="none" className="opacity-60">
      <path
        d="M2 18 L10 16 L18 20 L26 14 L34 16 L42 8 L50 12 L58 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={color}
      />
    </svg>
  );
}

function AlgoCard({ algo }: { algo: AlgoSummary }) {
  const risk = RISK_CONFIG[algo.riskClass] ?? RISK_CONFIG.MEDIUM;

  return (
    <article className="card group relative overflow-hidden border border-white/8 bg-white/3 p-7 flex flex-col transition-all duration-300 hover:-translate-y-1.5 hover:border-jpm-gold/35 hover:shadow-[0_20px_50px_rgba(212,175,55,0.08)] backdrop-blur-md">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(212,175,55,0.05),_transparent_60%)]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-jpm-gold/0 via-jpm-gold/50 to-jpm-gold/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Risk badge */}
      <div className="flex items-center justify-between mb-5">
        <span className={`text-[9px] uppercase tracking-[0.2em] font-semibold border px-2.5 py-1 rounded-full ${risk.badge}`}>
          {risk.label}
        </span>
        {algo.isActive && (
          <span className="flex items-center gap-1.5 text-[9px] uppercase tracking-[0.15em] text-emerald-400/70">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            Active
          </span>
        )}
      </div>

      <h2 className="font-serif text-xl text-white leading-snug mb-2">{algo.name}</h2>
      <p className="text-sm text-white/45 leading-relaxed flex-1">{algo.description}</p>

      {/* Performance metrics */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="bg-white/3 border border-white/8 rounded-lg p-4 relative overflow-hidden group/metric">
          <p className="text-[9px] uppercase tracking-[0.18em] text-white/35 mb-1">Monthly ROI</p>
          <div className="flex items-end justify-between">
            <p className={`text-lg font-semibold font-serif ${risk.text}`}>+{algo.monthlyRoi.toFixed(2)}%</p>
            <Sparkline color={risk.text} />
          </div>
          <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-jpm-gold/20 to-transparent translate-x-full group-hover/metric:translate-x-0 transition-transform duration-500" />
        </div>
        <div className="bg-white/3 border border-white/8 rounded-lg p-4">
          <p className="text-[9px] uppercase tracking-[0.18em] text-white/35 mb-1">Min Capital</p>
          <p className="text-lg font-semibold font-serif text-white">${algo.minCapital.toLocaleString()}</p>
        </div>
      </div>

      {/* Risk bar visualization */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[9px] uppercase tracking-[0.15em] text-white/30">Risk Exposure</span>
          <span className={`text-[9px] font-semibold ${risk.text}`}>{algo.riskClass}</span>
        </div>
        <div className="h-px w-full bg-white/8 rounded-full overflow-hidden">
          <div
            className={`h-full ${risk.bar} rounded-full`}
            style={{
              width: algo.riskClass === "LOW" ? "33%" : algo.riskClass === "MEDIUM" ? "60%" : "88%",
            }}
          />
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div>
          <p className="text-[9px] uppercase tracking-[0.15em] text-white/30 mb-0.5">License Price</p>
          <p className="font-serif text-2xl text-jpm-gold">${algo.price.toLocaleString()}</p>
        </div>
        <Link
          href={`/algos/${algo.slug}`}
          className="bg-gradient-to-r from-jpm-gold-dark via-jpm-gold to-jpm-gold-light text-[#020617] px-5 py-2.5 rounded-sm text-[10px] font-bold uppercase tracking-[0.16em] hover:shadow-[0_0_20px_rgba(212,175,55,0.35)] transition-all duration-300 hover:-translate-y-px"
        >
          License Now →
        </Link>
      </div>

      {/* Compliance disclaimer */}
      <p className="mt-5 text-[9px] text-white/20 leading-relaxed border-t border-white/5 pt-4">
        {algo.complianceDisclaimer}
      </p>
    </article>
  );
}

export default async function AlgosPage() {
  const algos = await listAlgos();

  return (
    <main className="min-h-screen bg-[#020617] pt-28 pb-20 px-6 text-white">
      {/* Background glow */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_0%,rgba(212,175,55,0.06),transparent)] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative">
        {/* Page header */}
        <div className="mb-14">
          <p className="text-[10px] uppercase tracking-[0.28em] text-jpm-gold/70 mb-3">License Engine</p>
          <h1 className="font-serif text-4xl md:text-5xl text-white tracking-[-0.01em]">Institutional Algorithms</h1>
          <p className="mt-4 text-sm text-white/45 max-w-2xl leading-relaxed">
            Strategy access is structured through controlled licensing with transparent risk descriptors,
            performance context, and server-side entitlement validation. Past performance is not indicative of future results.
          </p>
        </div>

        {/* Risk legend */}
        <div className="flex gap-4 mb-10">
          {Object.entries(RISK_CONFIG).map(([key, cfg]) => (
            <div key={key} className={`flex items-center gap-2 text-[9px] uppercase tracking-[0.15em] border px-3 py-1.5 rounded-full ${cfg.badge}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.bar}`} />
              {cfg.label}
            </div>
          ))}
        </div>

        {algos.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white/40">No algorithms are listed at the moment</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {algos.map((algo) => (
              <AlgoCard key={algo.id} algo={algo} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
