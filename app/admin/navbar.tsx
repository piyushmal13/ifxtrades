"use client";

import { AdminSidebar } from "@/components/admin/AdminSidebar";

/**
 * Compatibility wrapper for legacy imports that expected app/admin/navbar.
 * New layouts should prefer AdminShell + AdminSidebar directly.
 */
export default function AdminNavbar() {
  return <AdminSidebar />;
}
