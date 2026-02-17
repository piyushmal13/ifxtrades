"use client"

import { useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-provider"
import { motion } from "framer-motion"

export default function LoginPage() {

  const { supabase } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const redirectTo = searchParams.get("redirect") || "/dashboard"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const login = async () => {
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    router.push(redirectTo)
  }

  const signup = async () => {
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    router.push(redirectTo)
  }

  const google = async () => {
    setLoading(true)

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirect=${redirectTo}`,
      },
    })
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center relative overflow-hidden">

      {/* Background Accent Layer */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#C6A23A]/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-black/5 rounded-full blur-3xl -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-white border shadow-2xl rounded-3xl p-12 space-y-8"
      >

        <div className="text-center space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-black">
            Access IFXTrades
          </h1>
          <p className="text-sm text-gray-500">
            Institutional Capital Intelligence Platform
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-4 rounded-lg">
            {error}
          </div>
        )}

        <div className="space-y-5">

          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-[#C6A23A] outline-none"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-[#C6A23A] outline-none"
          />

        </div>

        <div className="space-y-4">

          <button
            onClick={login}
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "Processing..." : "Login"}
          </button>

          <button
            onClick={signup}
            disabled={loading}
            className="w-full border py-3 rounded-lg font-medium hover:bg-gray-50 transition disabled:opacity-50"
          >
            Create Account
          </button>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t"></div>
            <span className="px-3 text-xs text-gray-400">OR</span>
            <div className="flex-grow border-t"></div>
          </div>

          <button
            onClick={google}
            disabled={loading}
            className="w-full bg-[#C6A23A] text-white py-3 rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50"
          >
            Continue with Google
          </button>

        </div>

      </motion.div>
    </div>
  )
}
