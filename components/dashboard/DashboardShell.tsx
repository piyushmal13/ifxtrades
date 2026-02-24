"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type DashboardShellProps = {
  children: React.ReactNode;
};

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/licenses", label: "Licenses" },
  { href: "/dashboard/courses", label: "Courses" },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === "/dashboard";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DashboardShell({ children }: DashboardShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <div className="ifx-page-shell pt-24 pb-10">
      <div className="ifx-page-container grid gap-6 lg:grid-cols-[250px_minmax(0,1fr)]">
        <div className="lg:hidden card border border-white/10 bg-white/5 p-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.16em] text-jpm-gold">
              Portal
            </p>
            <p className="font-serif text-lg text-white">Dashboard</p>
          </div>
          <button
            type="button"
            className="btn-outline btn-sm"
            onClick={() => setMobileOpen((open) => !open)}
            aria-expanded={mobileOpen}
            aria-controls="dashboard-nav"
          >
            {mobileOpen ? "Close" : "Menu"}
          </button>
        </div>

        <aside
          id="dashboard-nav"
          className={`${mobileOpen ? "block" : "hidden"} lg:block card border border-white/10 bg-white/4 p-5 h-fit`}
        >
          <p className="text-[10px] uppercase tracking-[0.16em] text-jpm-gold mb-2">
            Portal
          </p>
          <h2 className="font-serif text-xl mb-4 text-white">Dashboard</h2>
          <nav className="flex flex-col gap-2">
            {NAV_ITEMS.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-sm px-3 py-2 text-sm transition-colors ${active
                      ? "bg-jpm-gold/12 border border-jpm-gold/30 text-jpm-gold"
                      : "border border-transparent text-white/70 hover:text-white hover:bg-white/5"
                    }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main>{children}</main>
      </div>
    </div>
  );
}

