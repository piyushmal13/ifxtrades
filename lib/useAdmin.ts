"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "./auth-provider"

export function useAdmin() {

  const { session, supabase, loading } = useAuth()
  const router = useRouter()
  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {

    if (!session) return

    const fetchRole = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single()

      if (!data || data.role !== "admin") {
        router.push("/")
      } else {
        setRole("admin")
      }
    }

    fetchRole()

  }, [session, supabase, router])

  return { role, loading }
}
