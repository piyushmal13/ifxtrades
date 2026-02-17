"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "./auth-provider"

export function useProtected() {

  const { session, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !session) {
      router.push("/login")
    }
  }, [session, loading, router])

  return { session, loading }
}
