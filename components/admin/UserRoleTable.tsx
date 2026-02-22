"use client";

import { useState } from "react";

type UserRow = {
  id: string;
  email: string;
  role: string;
  createdAt: string | null;
};

export default function UserRoleTable({ users }: { users: UserRow[] }) {
  const [rows, setRows] = useState(users);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const updateRole = async (userId: string, role: "USER" | "ADMIN") => {
    setLoadingId(userId);
    const response = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, role }),
    });

    if (response.ok) {
      setRows((current) =>
        current.map((row) => (row.id === userId ? { ...row, role } : row)),
      );
    }
    setLoadingId(null);
  };

  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-jpm-border text-left">
            <th className="p-4">Email</th>
            <th className="p-4">Role</th>
            <th className="p-4">Created</th>
            <th className="p-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((user) => (
            <tr key={user.id} className="border-b border-jpm-border/70">
              <td className="p-4">{user.email}</td>
              <td className="p-4 uppercase">{user.role}</td>
              <td className="p-4">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"}
              </td>
              <td className="p-4">
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="btn-outline"
                    disabled={loadingId === user.id}
                    onClick={() => updateRole(user.id, "USER")}
                  >
                    USER
                  </button>
                  <button
                    type="button"
                    className="btn-primary"
                    disabled={loadingId === user.id}
                    onClick={() => updateRole(user.id, "ADMIN")}
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
