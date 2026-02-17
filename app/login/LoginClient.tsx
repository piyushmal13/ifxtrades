"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-provider"
import { useState } from "react"
import { motion } from "framer-motion"

export default function LoginClient() {
  const { supabase } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const redirect = searchParams.get("redirect")

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const login = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (!error) {
      router.push(redirect || "/dashboard")
    }
  }

  const signup = async () => {
    await supabase.auth.signUp({ email, password })
  }

  const google = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-gray-100">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-2xl rounded-2xl p-12 w-[420px] space-y-6"
      >
        <h1 className="text-3xl font-semibold text-[#C6A23A]">
          Access IFXTrades
        </h1>

        <input
          className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-[#C6A23A] outline-none"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-[#C6A23A] outline-none"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={login}
          className="w-full bg-black text-white py-3 rounded-lg hover:opacity-90 transition"
        >
          Login
        </button>

        <button
          onClick={signup}
          className="w-full border py-3 rounded-lg hover:bg-gray-50 transition"
        >
          Create Account
        </button>

        <button
          onClick={google}
          className="w-full bg-[#C6A23A] text-white py-3 rounded-lg hover:opacity-90 transition"
        >
          Continue with Google
        </button>
      </motion.div>
    </div>
  )
}
