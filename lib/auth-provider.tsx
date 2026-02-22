"use client";

import type { Session, User } from "@supabase/supabase-js";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { normalizeRole, type PlatformRole } from "@/lib/auth-shared";

type AuthContextValue = {
  supabase: ReturnType<typeof createSupabaseBrowserClient>;
  session: Session | null;
  user: User | null;
  role: PlatformRole;
  loading: boolean;
  refreshRole: (currentUser?: User | null) => Promise<PlatformRole>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [supabase] = useState(createSupabaseBrowserClient);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<PlatformRole>("user");
  const [loading, setLoading] = useState(true);

  const resolveRole = useCallback(
    async (currentUser?: User | null) => {
      if (!currentUser) {
        setRole("user");
        return "user";
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", currentUser.id)
        .maybeSingle();

      if (profile?.role) {
        const resolved = normalizeRole(profile.role);
        setRole(resolved);
        return resolved;
      }

      const metadataRole = normalizeRole(
        currentUser.app_metadata?.role ?? currentUser.user_metadata?.role,
      );
      if (metadataRole === "admin") {
        setRole("admin");
        return "admin";
      }

      const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL?.toLowerCase();
      const fallbackRole =
        adminEmail && currentUser.email?.toLowerCase() === adminEmail
          ? "admin"
          : "user";
      setRole(fallbackRole);
      return fallbackRole;
    },
    [supabase],
  );

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      await resolveRole(data.session?.user ?? null);
      setLoading(false);
    };

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      resolveRole(currentSession?.user ?? null);
      router.refresh();
    });

    return () => subscription.unsubscribe();
  }, [router, resolveRole, supabase]);

  return (
    <AuthContext.Provider
      value={{
        supabase,
        session,
        user: session?.user ?? null,
        role,
        loading,
        refreshRole: resolveRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }
  return context;
}
