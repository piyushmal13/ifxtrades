"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-provider"
import { useState } from "react"
import { motion } from "framer-motion"

export default function LoginClient({
  initialView = "login",
}: {
  initialView?: "login" | "signup";
}) {
  const { supabase } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const redirect = searchParams.get("redirect")

  const [view, setView] = useState<"login" | "signup" | "verify" | "forgotPassword">(initialView)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null)

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  const handleLogin = async () => {
    if (!validateEmail(email)) {
      setMessage({ text: "Please enter a valid email address.", type: "error" })
      return
    }
    setLoading(true)
    setMessage(null)
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (!error) {
      router.push(redirect || "/dashboard")
    } else {
      setMessage({ text: error.message, type: "error" })
    }
    setLoading(false)
  }

  const handleSignup = async () => {
    if (!validateEmail(email)) {
      setMessage({ text: "Please enter a valid email address.", type: "error" })
      return
    }
    setLoading(true)
    setMessage(null)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    if (error) {
      setMessage({ text: error.message, type: "error" })
    } else if (data.user && !data.session) {
      setView("verify")
      setMessage({ text: "Verification code sent to your email.", type: "success" })
    } else {
      router.push(redirect || "/dashboard")
    }
    setLoading(false)
  }

  const handleVerify = async () => {
    setLoading(true)
    setMessage(null)
    const { error } = await supabase.auth.verifyOtp({ email, token: otp, type: "signup" })
    if (error) setMessage({ text: error.message, type: "error" })
    else router.push(redirect || "/dashboard")
    setLoading(false)
  }

  const handleForgotPassword = async () => {
    if (!validateEmail(email)) {
      setMessage({ text: "Please enter a valid email address.", type: "error" })
      return
    }
    setLoading(true)
    setMessage(null)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    })
    if (error) {
      setMessage({ text: error.message, type: "error" })
    } else {
      setMessage({ text: "Password reset instructions sent.", type: "success" })
    }
    setLoading(false)
  }

  const google = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin
      }
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-jpm-cream px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-jpm-border shadow-jpm-md rounded-sm p-10 w-full max-w-[420px] space-y-5"
      >
        <h1 className="text-2xl font-serif font-bold text-jpm-navy">
          {view === "login" && "Welcome Back"}
          {view === "signup" && "Create Account"}
          {view === "verify" && "Verify Email"}
          {view === "forgotPassword" && "Reset Password"}
        </h1>

        {message && (
          <div
            className={`p-3 rounded text-sm ${
              message.type === "error"
                ? "bg-red-50 text-red-700 border border-red-100"
                : "bg-emerald-50 text-emerald-700 border border-emerald-100"
            }`}
          >
            {message.text}
          </div>
        )}

        {view === "signup" && (
          <input
            className="w-full border border-jpm-border p-3 rounded-sm focus:ring-1 focus:ring-jpm-gold focus:border-jpm-gold outline-none"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        )}

        {view !== "verify" && (
          <>
            <input
              className="w-full border border-jpm-border p-3 rounded-sm focus:ring-1 focus:ring-jpm-gold focus:border-jpm-gold outline-none"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            {view !== "forgotPassword" && (
              <input
                type="password"
                className="w-full border border-jpm-border p-3 rounded-sm focus:ring-1 focus:ring-jpm-gold focus:border-jpm-gold outline-none"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            )}
          </>
        )}

        {view === "verify" && (
          <input
            className="w-full border border-jpm-border p-3 rounded-sm focus:ring-1 focus:ring-jpm-gold focus:border-jpm-gold outline-none text-center tracking-widest text-xl"
            placeholder="Enter 6-digit Code"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
        )}

        {view === "login" && (
          <>
            <div className="flex justify-end">
              <button
                onClick={() => setView("forgotPassword")}
                className="text-sm text-jpm-muted hover:text-jpm-gold"
              >
                Forgot Password?
              </button>
            </div>
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-jpm-navy text-white py-3 rounded-sm hover:bg-jpm-navy-light transition disabled:opacity-50 text-xs font-semibold uppercase tracking-[0.14em]"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </>
        )}

        {view === "signup" && (
          <button
            onClick={handleSignup}
            disabled={loading}
            className="w-full bg-jpm-navy text-white py-3 rounded-sm hover:bg-jpm-navy-light transition disabled:opacity-50 text-xs font-semibold uppercase tracking-[0.14em]"
          >
            {loading ? "Signing up..." : "Sign Up"}
          </button>
        )}

        {view === "verify" && (
          <button
            onClick={handleVerify}
            disabled={loading}
            className="w-full bg-jpm-gold text-white py-3 rounded-sm hover:bg-jpm-gold-light transition disabled:opacity-50 text-xs font-semibold uppercase tracking-[0.14em]"
          >
            {loading ? "Verifying..." : "Verify & Login"}
          </button>
        )}

        {view === "forgotPassword" && (
          <button
            onClick={handleForgotPassword}
            disabled={loading}
            className="w-full bg-jpm-navy text-white py-3 rounded-sm hover:bg-jpm-navy-light transition disabled:opacity-50 text-xs font-semibold uppercase tracking-[0.14em]"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        )}

        {view !== "verify" && (
          <div className="flex justify-between text-sm text-jpm-muted mt-4">
            {view === "forgotPassword" ? (
              <button onClick={() => setView("login")} className="hover:text-jpm-gold">
                Back to Login
              </button>
            ) : (
              <button onClick={() => setView(view === "login" ? "signup" : "login")} className="hover:text-jpm-gold">
                {view === "login" ? "Need an account? Sign Up" : "Already have an account? Login"}
              </button>
            )}
          </div>
        )}

        {view === "login" && (
          <>
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-jpm-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-jpm-muted">Or continue with</span>
              </div>
            </div>

            <button
              onClick={google}
              className="w-full border border-jpm-border text-jpm-navy py-3 rounded-sm hover:bg-jpm-cream transition flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </button>
          </>
        )}
      </motion.div>
    </div>
  )
}
