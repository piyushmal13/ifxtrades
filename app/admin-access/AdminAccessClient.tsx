"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-provider";
import type { PlatformRole } from "@/lib/auth-shared";

type AdminAccessClientProps = {
  email: string;
  initialRole: PlatformRole;
};

export default function AdminAccessClient({
  email,
  initialRole,
}: AdminAccessClientProps) {
  const router = useRouter();
  const { user, refreshRole } = useAuth();
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isAlreadyAdmin = initialRole === "admin";

  const handleBootstrap = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);

    const response = await fetch("/api/admin/bootstrap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: token.trim() || undefined }),
    });

    const body = await response.json().catch(() => ({}));

    if (!response.ok) {
      setError(body.error ?? "Failed to grant admin access.");
      setLoading(false);
      return;
    }

    await refreshRole(user ?? null);
    setMessage(body.message ?? "Admin access granted.");
    setLoading(false);

    router.push("/admin");
    router.refresh();
  };

  return (
    <main className="min-h-screen bg-[#020617] pt-28 pb-20 px-6 text-white">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_0%,rgba(212,175,55,0.06),transparent)] pointer-events-none" />
      <section className="max-w-2xl mx-auto relative z-10 card p-8 space-y-6">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-jpm-gold mb-2">
            Admin Recovery
          </p>
          <h1 className="font-serif text-3xl text-white">Admin Access</h1>
          <p className="mt-3 text-sm text-white/55">
            Signed in as {email || "authenticated user"}. Use this recovery panel
            if `/admin` is currently inaccessible.
          </p>
        </div>

        {isAlreadyAdmin ? (
          <div className="space-y-4">
            <p className="text-sm text-emerald-300">
              Your account already has admin privileges.
            </p>
            <button
              type="button"
              onClick={() => router.push("/admin")}
              className="btn-primary"
            >
              Go To Admin Panel
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <label className="flex flex-col gap-2">
              <span className="text-xs uppercase tracking-[0.12em] text-jpm-muted">
                Bootstrap Token (Optional)
              </span>
              <input
                value={token}
                onChange={(event) => setToken(event.target.value)}
                placeholder="IFX_ADMIN_BOOTSTRAP_TOKEN"
                className="border border-jpm-border rounded-sm px-3 py-2 text-sm bg-white/5"
              />
            </label>

            <button
              type="button"
              className="btn-primary"
              disabled={loading}
              onClick={handleBootstrap}
            >
              {loading ? "Granting Access..." : "Grant Admin Access"}
            </button>

            {message && <p className="text-sm text-emerald-300">{message}</p>}
            {error && <p className="text-sm text-red-300">{error}</p>}

            <p className="text-xs text-white/40 leading-relaxed">
              Bootstrap succeeds when no admin exists, or when your email/token
              is explicitly allowlisted via environment variables.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
