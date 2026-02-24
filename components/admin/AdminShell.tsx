"use client";

import { useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

type AdminShellProps = {
  children: React.ReactNode;
};

export function AdminShell({ children }: AdminShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex relative" style={{ background: "var(--color-bg-primary)" }}>
      <div className="hidden lg:flex">
        <AdminSidebar />
      </div>

      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          type="button"
          className="btn-outline btn-sm"
          onClick={() => setMobileOpen((open) => !open)}
          aria-expanded={mobileOpen}
          aria-controls="admin-mobile-nav"
        >
          {mobileOpen ? "Close" : "Admin Menu"}
        </button>
      </div>

      {mobileOpen && (
        <>
          <button
            type="button"
            className="lg:hidden fixed inset-0 z-40 bg-black/65 backdrop-blur-[1px]"
            aria-label="Close admin navigation"
            onClick={() => setMobileOpen(false)}
          />
          <div
            id="admin-mobile-nav"
            className="lg:hidden fixed inset-y-0 left-0 z-50"
          >
            <AdminSidebar onNavigate={() => setMobileOpen(false)} />
          </div>
        </>
      )}

      <div className="flex-1 min-w-0 pt-24 px-4 md:px-6 lg:px-8 pb-12 overflow-y-auto">
        <div className="max-w-6xl mx-auto">{children}</div>
      </div>
    </div>
  );
}

