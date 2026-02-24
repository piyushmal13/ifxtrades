"use client";

import { useState } from "react";

type UserRow = {
  id: string;
  email: string;
  role: "user" | "admin" | string;
  createdAt: string | null;
};

export default function UserRoleTable({ users }: { users: UserRow[] }) {
  const [rows, setRows] = useState(users);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const updateRole = async (userId: string, role: "user" | "admin") => {
    setLoadingId(userId);
    const response = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, role }),
    });
    const body = await response.json().catch(() => ({}));

    if (response.ok) {
      const nextRole =
        typeof body?.item?.role === "string" ? body.item.role : role;
      setRows((current) =>
        current.map((row) => (row.id === userId ? { ...row, role: nextRole } : row)),
      );
    }
    setLoadingId(null);
  };

  return (
    <div className="card border border-white/10 bg-white/3 overflow-x-auto text-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10 text-left text-[10px] uppercase tracking-[0.15em] text-white/40">
            <th className="p-4">Email</th>
            <th className="p-4">Role</th>
            <th className="p-4">Created</th>
            <th className="p-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((user) => (
            <tr key={user.id} className="border-b border-white/5">
              <td className="p-4">{user.email}</td>
              <td className="p-4 uppercase text-jpm-gold">{String(user.role)}</td>
              <td className="p-4 text-white/70">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"}
              </td>
              <td className="p-4">
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="btn-outline"
                    disabled={loadingId === user.id}
                    onClick={() => updateRole(user.id, "user")}
                  >
                    USER
                  </button>
                  <button
                    type="button"
                    className="btn-primary"
                    disabled={loadingId === user.id}
                    onClick={() => updateRole(user.id, "admin")}
                  >
                    ADMIN
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
