"use client"

import { createBrowserClient } from "@supabase/ssr"
import { createContext, useContext, useEffect, useState, ReactNode } from "react"

const AuthContext = createContext<any>(null)

export function AuthProvider({ children }: { children: ReactNode }) {

  const [supabase] = useState(() =>
    createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  )

  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {

    const init = async () => {
      const { data } = await supabase.auth.getSession()
      setSession(data.session)
      setLoading(false)
    }

    init()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()

  }, [supabase])

  return (
    <AuthContext.Provider value={{ supabase, session, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
