import Link from "next/link";

export const dynamic = "force-dynamic";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#020617] pt-28 px-6 text-white">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_0%,rgba(212,175,55,0.06),transparent)] pointer-events-none" />

      <div className="max-w-3xl mx-auto relative">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ifx-gold/70 mb-3">
          Route Not Found
        </p>
        <h1 className="text-3xl md:text-4xl font-serif font-bold mb-4">
          The requested page is not available.
        </h1>
        <p className="text-white/50 text-sm mb-8 leading-relaxed">
          Use primary navigation to continue to webinars, algorithms, university,
          blog, reviews, or your dashboard.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/" className="btn-primary">
            Home
          </Link>
          <Link href="/webinars" className="btn-outline">
            Webinars
          </Link>
        </div>
      </div>
    </main>
  );
}
