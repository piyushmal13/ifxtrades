"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-provider";

export function useAdmin(redirectTarget = "/dashboard") {
  const { role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && role !== "admin") {
      router.push(redirectTarget);
    }
  }, [loading, redirectTarget, role, router]);

  return { role, loading };
}
