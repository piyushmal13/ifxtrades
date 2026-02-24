export const dynamic = "force-dynamic";

import { requireUser } from "@/lib/auth";
import AdminAccessClient from "./AdminAccessClient";

export default async function AdminAccessPage() {
  const auth = await requireUser("/admin-access");

  return (
    <AdminAccessClient
      email={auth.user?.email ?? ""}
      initialRole={auth.role}
    />
  );
}
