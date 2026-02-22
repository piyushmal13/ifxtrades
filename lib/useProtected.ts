"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-provider";

export function useProtected(redirectTarget = "/login") {
  const { session, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !session) {
      router.push(redirectTarget);
    }
  }, [loading, redirectTarget, router, session]);

  return { session, loading };
}
