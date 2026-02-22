import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-jpm-cream pt-28 px-6">
      <div className="max-w-3xl mx-auto">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-jpm-gold mb-2">
          Route not found
        </p>
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-jpm-navy mb-4">
          The requested page is not available.
        </h1>
        <p className="text-jpm-muted text-sm mb-8">
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
