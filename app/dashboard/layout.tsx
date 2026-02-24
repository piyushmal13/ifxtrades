import Link from "next/link";
import { requireUser } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireUser("/dashboard");

  const nav = [
    { href: "/dashboard", label: "Overview" },
    { href: "/dashboard/licenses", label: "Licenses" },
    { href: "/dashboard/courses", label: "Courses" },
  ];

  return (
    <div className="min-h-screen bg-[#020617] pt-24 px-6 pb-10 text-white">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-[220px_minmax(0,1fr)] gap-6">
        <aside className="card border border-white/10 bg-white/3 p-5 h-fit">
          <p className="text-[10px] uppercase tracking-[0.16em] text-jpm-gold mb-2">
            Portal
          </p>
          <h2 className="font-serif text-xl mb-4">Dashboard</h2>
          <nav className="flex flex-col gap-2">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-white/70 hover:text-jpm-gold transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main>{children}</main>
      </div>
    </div>
  );
}
