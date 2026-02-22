import UserRoleTable from "@/components/admin/UserRoleTable";
import { listCrmUsers } from "@/lib/data/platform";

export default async function AdminUsersPage() {
  const users = await listCrmUsers(300);

  return (
    <div>
      <p className="text-xs uppercase tracking-[0.2em] text-jpm-gold mb-2">Users</p>
      <h1 className="font-serif text-4xl text-jpm-navy">User Access Control</h1>
      <p className="mt-4 text-sm text-jpm-muted max-w-3xl">
        Manage roles directly from the control panel. Access changes apply to
        admin routes and enterprise operations.
      </p>

      <div className="mt-8">
        <UserRoleTable users={users} />
      </div>
    </div>
  );
}
