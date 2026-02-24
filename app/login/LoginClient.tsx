"use client"

import { useSearchParams, useRouter } from "next/navigation"
import Image from "next/image"
import { useAuth } from "@/lib/auth-provider"
import { useState } from "react"
import { motion, AnimatePresence, Variants } from "framer-motion"

import { getAuthCallbackUrl } from "@/lib/site"


export default function LoginClient({
  initialView = "login",
}: {
  initialView?: "login" | "signup";
}) {
  const { supabase } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const redirectAfterAuth = searchParams.get("redirect") ?? "/dashboard"


  const [view, setView] = useState<"login" | "signup" | "verify" | "forgotPassword">(initialView)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null)

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  // ─── Login ──────────────────────────────────────────────────────────────────
  const handleLogin = async () => {
    if (!validateEmail(email)) {
      setMessage({ text: "Please enter a valid email address.", type: "error" })
      return
    }
    setLoading(true)
    setMessage(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (!error) {
      router.push(redirectAfterAuth)
    } else {
      setMessage({ text: error.message, type: "error" })
    }
    setLoading(false)
  }

  // ─── Signup ──────────────────────────────────────────────────────────────────
  const handleSignup = async () => {
    if (!validateEmail(email)) {
      setMessage({ text: "Please enter a valid email address.", type: "error" })
      return
    }
    if (password.length < 6) {
      setMessage({ text: "Password must be at least 6 characters.", type: "error" })
      return
    }
    setLoading(true)
    setMessage(null)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        // ✅ FIX: provide a proper emailRedirectTo so the magic-link in the
        //         confirmation email lands on our callback route, not a Supabase URL.
        emailRedirectTo: getAuthCallbackUrl(redirectAfterAuth),
      },
    })

    if (error) {
      setMessage({ text: error.message, type: "error" })
    } else if (data.user && !data.session) {
      // Email confirmation required — switch to OTP entry screen
      setView("verify")
      setMessage({
        text: "A 6-digit verification code has been sent to your email.",
        type: "success",
      })
    } else if (data.session) {
      // Auto-confirmed (e.g. email confirmation disabled in Supabase settings)
      router.push(redirectAfterAuth)
    } else {
      // Edge case: user object but no session and no error usually means the
      // user already exists but is unconfirmed — resend the OTP.
      setView("verify")
      setMessage({
        text: "Account exists but is unverified. A new code has been sent to your email.",
        type: "success",
      })
    }
    setLoading(false)
  }

  // ─── Verify OTP ──────────────────────────────────────────────────────────────
  const handleVerify = async () => {
    setLoading(true)
    setMessage(null)

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "signup",
    })

    if (error) {
      setMessage({ text: error.message, type: "error" })
    } else {
      router.push(redirectAfterAuth)
    }
    setLoading(false)
  }

  // ─── Resend OTP ──────────────────────────────────────────────────────────────
  const handleResend = async () => {
    setResendLoading(true)
    setMessage(null)

    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: getAuthCallbackUrl(redirectAfterAuth),
      },
    })

    if (error) {
      setMessage({ text: error.message, type: "error" })
    } else {
      setMessage({ text: "A new verification code has been sent.", type: "success" })
    }
    setResendLoading(false)
  }

  // ─── Forgot Password ─────────────────────────────────────────────────────────
  const handleForgotPassword = async () => {
    if (!validateEmail(email)) {
      setMessage({ text: "Please enter a valid email address.", type: "error" })
      return
    }
    setLoading(true)
    setMessage(null)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      // ✅ FIX: point to our callback so Supabase knows where to land after reset
      redirectTo: getAuthCallbackUrl("/dashboard"),
    })

    if (error) {
      setMessage({ text: error.message, type: "error" })
    } else {
      setMessage({
        text: "Password reset instructions sent. Check your inbox.",
        type: "success",
      })
    }
    setLoading(false)
  }

  // ─── Google OAuth ─────────────────────────────────────────────────────────────
  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        // ✅ FIX: use the proper callback URL, not bare origin
        redirectTo: getAuthCallbackUrl(redirectAfterAuth),
      },
    })
  }

  // ─── Animation Variants ───────────────────────────────────────────────────────
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
  }

  const shimmerAnimation = {
    animate: {
      backgroundPosition: ["200% 0", "-200% 0"],
      transition: { repeat: Infinity, duration: 8, ease: "linear" as const },
    },
  }

  // ─── UI ───────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-jpm-cream px-4 relative overflow-hidden">
      {/* Background Animated Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-gold-gradient rounded-full mix-blend-screen filter blur-[120px] opacity-10"
          animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-jpm-gold rounded-full mix-blend-screen filter blur-[100px] opacity-[0.07]"
          animate={{ x: [0, -40, 0], y: [0, -30, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
      </div>

      <div className="relative z-10 w-full max-w-[440px]">
        {/* Subtle glowing border glow behind card */}
        <div className="absolute inset-0 bg-gold-gradient blur-xl opacity-20 rounded-2xl animate-pulse-slow"></div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative bg-[#0a0a0a]/80 backdrop-blur-2xl border border-jpm-border/30 shadow-glass rounded-2xl p-10 md:p-12 w-full mx-auto"
        >
          {/* Logo / Brand Indicator */}
          <div className="flex justify-center mb-8">
            <Image
              src="/logo.png"
              alt="IFXTrades"
              width={52}
              height={52}
              className="rounded-full object-contain"
              priority
            />
          </div>

          <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
            <motion.div variants={itemVariants} className="text-center space-y-2">
              <h1 className="text-3xl font-serif font-bold tracking-wide bg-clip-text text-transparent bg-gold-gradient pb-1">
                {view === "login" && "Welcome Back"}
                {view === "signup" && "Create Account"}
                {view === "verify" && "Verify Email"}
                {view === "forgotPassword" && "Reset Password"}
              </h1>
              <p className="text-sm text-jpm-muted tracking-wider uppercase">
                Institutional Capital Intelligence
              </p>
            </motion.div>

            {/* Status message */}
            <AnimatePresence>
              {message && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`p-3 rounded-lg text-sm border backdrop-blur-md ${message.type === "error"
                    ? "bg-red-950/30 text-red-200 border-red-900/50 shadow-[0_0_15px_rgba(153,27,27,0.2)]"
                    : "bg-jpm-gold/10 text-jpm-gold-light border-jpm-gold/20 shadow-gold"
                    }`}
                >
                  {message.text}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-4 pt-2">
              {/* Full Name – signup only */}
              {view === "signup" && (
                <motion.div variants={itemVariants}>
                  <input
                    className="w-full bg-[#050505]/60 border border-jpm-border/30 text-jpm-ivory p-3.5 rounded-lg focus:ring-1 focus:ring-jpm-gold/60 focus:border-jpm-gold/60 outline-none transition-all placeholder:text-jpm-muted/50 text-sm"
                    placeholder="Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </motion.div>
              )}

              {/* Email + Password inputs */}
              {view !== "verify" && (
                <>
                  <motion.div variants={itemVariants}>
                    <input
                      className="w-full bg-[#050505]/60 border border-jpm-border/30 text-jpm-ivory p-3.5 rounded-lg focus:ring-1 focus:ring-jpm-gold/60 focus:border-jpm-gold/60 outline-none transition-all placeholder:text-jpm-muted/50 text-sm"
                      placeholder="Corporate or Personal Email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </motion.div>

                  {view !== "forgotPassword" && (
                    <motion.div variants={itemVariants}>
                      <input
                        type="password"
                        className="w-full bg-[#050505]/60 border border-jpm-border/30 text-jpm-ivory p-3.5 rounded-lg focus:ring-1 focus:ring-jpm-gold/60 focus:border-jpm-gold/60 outline-none transition-all placeholder:text-jpm-muted/50 text-sm"
                        placeholder="Password (min. 6 characters)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </motion.div>
                  )}
                </>
              )}

              {/* OTP input – verify screen */}
              {view === "verify" && (
                <motion.div variants={itemVariants}>
                  <input
                    className="w-full bg-[#050505]/60 border border-jpm-gold/40 text-jpm-gold-light p-4 rounded-lg focus:ring-1 focus:ring-jpm-gold focus:border-jpm-gold outline-none text-center tracking-[0.5em] text-2xl font-serif shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] transition-all placeholder:text-jpm-muted/30"
                    placeholder="------"
                    value={otp}
                    maxLength={6}
                    inputMode="numeric"
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  />
                </motion.div>
              )}

              {/* ── Forgot Password link ── */}
              {view === "login" && (
                <motion.div variants={itemVariants} className="flex justify-end pt-1">
                  <button
                    onClick={() => setView("forgotPassword")}
                    className="text-xs text-jpm-muted hover:text-jpm-gold transition-colors tracking-wider"
                  >
                    Forgot Password?
                  </button>
                </motion.div>
              )}
            </div>

            {/* ── Primary CTA buttons ── */}
            <motion.div variants={itemVariants} className="pt-4">
              {view === "login" && (
                <button
                  onClick={handleLogin}
                  disabled={loading}
                  className="w-full btn-accent relative overflow-hidden group py-3.5 rounded-lg shadow-gold-glow"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2 text-sm">
                    {loading ? "Authenticating..." : "Login to Workspace"}
                  </span>
                  <motion.div
                    className="absolute inset-0 bg-white/20"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                  />
                </button>
              )}

              {view === "signup" && (
                <button
                  onClick={handleSignup}
                  disabled={loading}
                  className="w-full btn-accent relative overflow-hidden group py-3.5 rounded-lg shadow-gold-glow"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2 text-sm">
                    {loading ? "Initializing..." : "Request Access"}
                  </span>
                  <motion.div
                    className="absolute inset-0 bg-white/20"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                  />
                </button>
              )}

              {view === "verify" && (
                <div className="space-y-4">
                  <button
                    onClick={handleVerify}
                    disabled={loading || otp.length < 6}
                    className="w-full btn-accent relative overflow-hidden group py-3.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-gold-glow"
                  >
                    <span className="relative z-10 text-sm">
                      {loading ? "Verifying..." : "Confirm & Access"}
                    </span>
                    {!loading && otp.length === 6 && (
                      <motion.div
                        className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)]"
                        animate={shimmerAnimation.animate}
                      />
                    )}
                  </button>
                  <button
                    onClick={handleResend}
                    disabled={resendLoading}
                    className="w-full text-xs text-jpm-muted hover:text-jpm-gold transition-colors tracking-wide disabled:opacity-50 text-center uppercase"
                  >
                    {resendLoading ? "Generating New Token..." : "Resend Security Token"}
                  </button>
                </div>
              )}

              {view === "forgotPassword" && (
                <button
                  onClick={handleForgotPassword}
                  disabled={loading}
                  className="w-full btn-accent relative overflow-hidden py-3.5 rounded-lg shadow-gold-glow"
                >
                  <span className="relative z-10 text-sm">
                    {loading ? "Transmitting..." : "Send Reset Protocol"}
                  </span>
                </button>
              )}
            </motion.div>

            {/* ── Navigation links ── */}
            {view !== "verify" && (
              <motion.div variants={itemVariants} className="pt-2">
                <div className="flex justify-center text-xs tracking-wider uppercase">
                  {view === "forgotPassword" ? (
                    <button onClick={() => setView("login")} className="text-jpm-muted hover:text-jpm-gold transition-colors flex items-center gap-2">
                      <span className="text-lg leading-none">&larr;</span> Return to Login
                    </button>
                  ) : (
                    <div className="text-jpm-muted">
                      {view === "login" ? "No existing credentials? " : "Already registered? "}
                      <button
                        onClick={() => setView(view === "login" ? "signup" : "login")}
                        className="text-jpm-gold hover:text-jpm-gold-light transition-colors ml-1 border-b border-jpm-gold/30 hover:border-jpm-gold pb-[2px]"
                      >
                        {view === "login" ? "Apply Here" : "Login Instead"}
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* ── Google OAuth ── */}
            {view === "login" && (
              <motion.div variants={itemVariants} className="pt-6">
                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-jpm-border/20"></div>
                  </div>
                  <div className="relative flex justify-center text-[10px] tracking-[0.2em] uppercase">
                    <span className="px-4 bg-[#0a0a0a] text-jpm-muted/60">Institutional SSO</span>
                  </div>
                </div>

                <button
                  onClick={handleGoogle}
                  className="w-full relative overflow-hidden group border border-jpm-border/30 bg-[#141414]/50 hover:bg-[#1f1f1f]/80 text-jpm-ivory py-3.5 rounded-lg transition-all flex items-center justify-center gap-3 backdrop-blur-sm"
                >
                  <svg className="w-4 h-4 opacity-90 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  <span className="text-sm font-medium tracking-wide">Continue with Google Workspaces</span>
                </button>
              </motion.div>
            )}
          </motion.div>
        </motion.div>

        {/* Footer legal text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="text-center text-[10px] text-jpm-muted/40 mt-8 tracking-wider uppercase max-w-sm mx-auto leading-relaxed px-4"
        >
          Protected by IFXTrades Institutional Security. By logging in, you agree to our terms of service and client privacy protocols.
        </motion.p>
      </div>
    </div>
  )
}
