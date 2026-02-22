import Link from "next/link";
import { requireAdmin } from "@/lib/auth";

const NAV_ITEMS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/crm", label: "CRM" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/webinars", label: "Webinars" },
  { href: "/admin/algos", label: "Algos" },
  { href: "/admin/university", label: "University" },
  { href: "/admin/blog", label: "Blog" },
  { href: "/admin/reviews", label: "Reviews" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin("/dashboard");

  return (
    <div className="min-h-screen bg-jpm-cream pt-24 px-6 pb-10">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-[240px_minmax(0,1fr)] gap-6">
        <aside className="card p-5 h-fit">
          <p className="text-xs uppercase tracking-[0.16em] text-jpm-gold mb-2">
            Enterprise Admin
          </p>
          <h2 className="font-serif text-xl text-jpm-navy mb-4">Control Panel</h2>
          <nav className="flex flex-col gap-2">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-jpm-navy hover:text-jpm-gold transition-colors"
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
