"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/lib/auth-provider";
import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { OtpInput } from "@/components/ui/OtpInput";
import { getAuthCallbackUrl } from "@/lib/site";
import { containerVariants, itemVariants, GRAVITY } from "@/lib/animations";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_RE = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

type View = "login" | "signup" | "verify" | "forgotPassword";
type Msg = { text: string; type: "success" | "error" };

export default function LoginClient({
  initialView = "login",
}: {
  initialView?: View;
}) {
  const { supabase } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");
  const redirectAfterAuth =
    redirectParam && redirectParam.startsWith("/") ? redirectParam : "/dashboard";

  const [view, setView] = useState<View>(initialView);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [otp, setOtp] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [message, setMessage] = useState<Msg | null>(null);
  const [emailError, setEmailError] = useState("");
  const [pwError, setPwError] = useState("");
  const [otpError, setOtpError] = useState(false);
  const [otpSuccess, setOtpSuccess] = useState(false);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const t = setTimeout(() => setResendCountdown((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCountdown]);

  const validateEmail = useCallback((v: string) => {
    if (!EMAIL_RE.test(v)) {
      setEmailError("Please enter a valid email address.");
      return false;
    }
    setEmailError("");
    return true;
  }, []);

  const validatePassword = useCallback((v: string) => {
    if (!PASSWORD_RE.test(v)) {
      setPwError("Min 8 chars, 1 uppercase, 1 number, 1 special character.");
      return false;
    }
    setPwError("");
    return true;
  }, []);

  const handleLogin = async () => {
    if (!validateEmail(email)) return;
    setLoading(true);
    setMessage(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error) {
      router.push(redirectAfterAuth);
    } else {
      const msg = error.message?.toLowerCase() ?? "";
      if (msg.includes("confirm") || msg.includes("verify")) {
        router.push(`/verify?email=${encodeURIComponent(email)}&redirect=${encodeURIComponent(redirectAfterAuth)}`);
        setLoading(false);
        return;
      }
      setMessage({ text: error.message, type: "error" });
    }
    setLoading(false);
  };

  const handleSignup = async () => {
    const emailOk = validateEmail(email);
    const pwOk = view === "signup" ? validatePassword(password) : true;
    if (!emailOk || !pwOk) return;
    setLoading(true);
    setMessage(null);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: getAuthCallbackUrl(redirectAfterAuth),
      },
    });
    if (error) {
      setMessage({ text: error.message, type: "error" });
    } else if (data.session) {
      router.push(redirectAfterAuth);
    } else {
      setView("verify");
      setResendCountdown(60);
      setMessage({ text: "A 6-digit security token has been sent to your email. Valid for 10 minutes.", type: "success" });
    }
    setLoading(false);
  };

  const handleVerify = async () => {
    setLoading(true);
    setMessage(null);
    setOtpError(false);
    const { error } = await supabase.auth.verifyOtp({ email, token: otp, type: "signup" });
    if (error) {
      setOtpError(true);
      setMessage({ text: error.message, type: "error" });
    } else {
      setOtpSuccess(true);
      setTimeout(() => router.push(redirectAfterAuth), 600);
    }
    setLoading(false);
  };

  const handleResend = async () => {
    if (resendCountdown > 0) return;
    setResendLoading(true);
    setMessage(null);
    const { error } = await supabase.auth.resend({ type: "signup", email, options: { emailRedirectTo: getAuthCallbackUrl(redirectAfterAuth) } });
    if (error) {
      setMessage({ text: error.message, type: "error" });
    } else {
      setMessage({ text: "A new security token has been transmitted.", type: "success" });
      setResendCountdown(60);
    }
    setResendLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!validateEmail(email)) return;
    setLoading(true);
    setMessage(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: getAuthCallbackUrl("/dashboard") });
    if (error) {
      setMessage({ text: error.message, type: "error" });
    } else {
      setMessage({ text: "Password reset instructions transmitted. Check your inbox.", type: "success" });
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: getAuthCallbackUrl(redirectAfterAuth) } });
  };

  const viewTitle: Record<View, string> = {
    login: "Welcome Back",
    signup: "Request Access",
    verify: "Verify Identity",
    forgotPassword: "Reset Credentials",
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ backgroundColor: "#080C14" }}
    >
      {/* Background gold radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 40% at 50% 50%, rgba(201,168,76,0.07) 0%, transparent 70%)",
        }}
      />
      {/* Animated ambient orbs */}
      <motion.div
        className="absolute top-[-15%] left-[-10%] w-[45%] h-[45%] rounded-full filter blur-[120px]"
        style={{ background: "rgba(201,168,76,0.06)" }}
        animate={{ x: [0, 40, 0], y: [0, 25, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-15%] right-[-10%] w-[40%] h-[40%] rounded-full filter blur-[100px]"
        style={{ background: "rgba(201,168,76,0.04)" }}
        animate={{ x: [0, -30, 0], y: [0, -20, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 3 }}
      />

      <div className="relative z-10 w-full max-w-[480px]">
        {/* Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, ease: GRAVITY }}
          style={{
            background: "rgba(13, 20, 33, 0.85)",
            backdropFilter: "blur(24px) saturate(180%)",
            border: "1px solid rgba(255,255,255,0.07)",
            boxShadow: "0 32px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
          }}
          className="rounded-2xl p-8 md:p-12 w-full"
        >
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
            {/* Logo */}
            <motion.div variants={itemVariants} className="flex justify-center">
              <Image
                src="/logo.png"
                alt="IFXTrades"
                width={56}
                height={56}
                className="rounded-full object-contain"
                priority
              />
            </motion.div>

            {/* Title */}
            <motion.div variants={itemVariants} className="text-center">
              <h1
                className="font-serif font-semibold mb-1"
                style={{ fontSize: "32px", color: "#C9A84C", letterSpacing: "-0.01em" }}
              >
                {viewTitle[view]}
              </h1>
              <p className="text-xs tracking-[0.2em] uppercase" style={{ color: "#4A5568" }}>
                Institutional Capital Intelligence
              </p>
            </motion.div>

            {/* Status message */}
            <AnimatePresence mode="wait">
              {message && (
                <motion.div
                  key={message.text}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.3 }}
                  className="px-4 py-3 rounded-xl text-sm"
                  style={{
                    background: message.type === "error" ? "rgba(239,68,68,0.08)" : "rgba(201,168,76,0.08)",
                    border: `1px solid ${message.type === "error" ? "rgba(239,68,68,0.3)" : "rgba(201,168,76,0.3)"}`,
                    color: message.type === "error" ? "#EF4444" : "#C9A84C",
                  }}
                >
                  {message.text}
                </motion.div>
              )}
            </AnimatePresence>

            {/* OTP Screen */}
            {view === "verify" && (
              <motion.div variants={itemVariants} className="space-y-6">
                <p className="text-center text-sm" style={{ color: "#8A95A3" }}>
                  Enter the 6-digit code sent to{" "}
                  <span style={{ color: "#C9A84C" }}>{email}</span>
                </p>
                <OtpInput
                  value={otp}
                  onChange={(v) => { setOtp(v); setOtpError(false); }}
                  hasError={otpError}
                  hasSuccess={otpSuccess}
                  disabled={loading || otpSuccess}
                />
                <button
                  onClick={handleVerify}
                  disabled={loading || otp.length < 6 || otpSuccess}
                  className="w-full relative overflow-hidden rounded-xl text-sm font-bold tracking-widest uppercase transition-all disabled:opacity-40"
                  style={{
                    height: "52px",
                    background: "linear-gradient(135deg, #8B6914 0%, #C9A84C 50%, #E6C97A 100%)",
                    color: "#080C14",
                  }}
                >
                  {loading ? "Verifying..." : otpSuccess ? "✓ Verified" : "Confirm & Access"}
                </button>
                <div className="text-center">
                  <button
                    onClick={handleResend}
                    disabled={resendCountdown > 0 || resendLoading}
                    className="text-xs tracking-wider uppercase transition-colors disabled:opacity-40"
                    style={{ color: resendCountdown > 0 ? "#4A5568" : "#C9A84C" }}
                  >
                    {resendCountdown > 0
                      ? `Resend available in ${resendCountdown}s`
                      : resendLoading
                        ? "Transmitting..."
                        : "Resend Security Token"}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Main Form */}
            {view !== "verify" && (
              <div className="space-y-4">
                {/* Full Name — signup only */}
                {view === "signup" && (
                  <motion.div variants={itemVariants}>
                    <input
                      className="w-full rounded-xl text-sm transition-all outline-none px-4"
                      style={{ height: "52px", background: "rgba(17,25,39,0.8)", border: "1px solid rgba(255,255,255,0.08)", color: "#F0EDE8" }}
                      placeholder="Full Name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      onFocus={(e) => (e.target.style.borderColor = "rgba(201,168,76,0.6)")}
                      onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
                    />
                  </motion.div>
                )}

                {/* Email */}
                <motion.div variants={itemVariants}>
                  <input
                    type="email"
                    className="w-full rounded-xl text-sm transition-all outline-none px-4"
                    style={{
                      height: "52px",
                      background: "rgba(17,25,39,0.8)",
                      border: `1px solid ${emailError ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.08)"}`,
                      color: "#F0EDE8",
                    }}
                    placeholder="Corporate or Personal Email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); if (emailError) validateEmail(e.target.value); }}
                    onBlur={(e) => validateEmail(e.target.value)}
                    onFocus={(e) => (e.target.style.borderColor = "rgba(201,168,76,0.6)")}
                  />
                  {emailError && (
                    <p className="mt-1 text-xs" style={{ color: "#EF4444" }}>{emailError}</p>
                  )}
                </motion.div>

                {/* Password */}
                {view !== "forgotPassword" && (
                  <motion.div variants={itemVariants} className="relative">
                    <input
                      type={showPw ? "text" : "password"}
                      className="w-full rounded-xl text-sm transition-all outline-none px-4 pr-12"
                      style={{
                        height: "52px",
                        background: "rgba(17,25,39,0.8)",
                        border: `1px solid ${pwError ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.08)"}`,
                        color: "#F0EDE8",
                      }}
                      placeholder={view === "signup" ? "Password (8+ chars, uppercase, number, special)" : "Password"}
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); if (pwError && view === "signup") validatePassword(e.target.value); }}
                      onBlur={() => view === "signup" && validatePassword(password)}
                      onFocus={(e) => (e.target.style.borderColor = "rgba(201,168,76,0.6)")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((v) => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-xs tracking-wide"
                      style={{ color: "#4A5568" }}
                    >
                      {showPw ? "HIDE" : "SHOW"}
                    </button>
                    {pwError && (
                      <p className="mt-1 text-xs" style={{ color: "#EF4444" }}>{pwError}</p>
                    )}
                  </motion.div>
                )}

                {/* Forgot Password link */}
                {view === "login" && (
                  <motion.div variants={itemVariants} className="flex justify-end">
                    <button
                      onClick={() => setView("forgotPassword")}
                      className="text-xs tracking-wider transition-colors"
                      style={{ color: "#8A95A3" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#C9A84C")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "#8A95A3")}
                    >
                      Forgot Password?
                    </button>
                  </motion.div>
                )}

                {/* Primary CTA */}
                <motion.div variants={itemVariants}>
                  <button
                    onClick={view === "login" ? handleLogin : view === "signup" ? handleSignup : handleForgotPassword}
                    disabled={loading}
                    className="w-full relative overflow-hidden rounded-xl font-bold text-sm tracking-widest uppercase transition-all disabled:opacity-50"
                    style={{
                      height: "52px",
                      background: "linear-gradient(135deg, #8B6914 0%, #C9A84C 50%, #E6C97A 100%)",
                      backgroundSize: "200%",
                      color: "#080C14",
                    }}
                  >
                    <motion.span
                      className="absolute inset-0"
                      style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)", backgroundSize: "200%" }}
                      initial={{ backgroundPosition: "-200% 0" }}
                      whileHover={{ backgroundPosition: "200% 0" }}
                      transition={{ duration: 0.8 }}
                    />
                    <span className="relative z-10">
                      {loading
                        ? "Processing..."
                        : view === "login"
                          ? "Access Workspace"
                          : view === "signup"
                            ? "Request Access"
                            : "Send Reset Protocol"}
                    </span>
                  </button>
                </motion.div>

                {/* Nav link */}
                <motion.div variants={itemVariants} className="text-center text-xs tracking-wider uppercase">
                  {view === "forgotPassword" ? (
                    <button
                      onClick={() => setView("login")}
                      style={{ color: "#8A95A3" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#C9A84C")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "#8A95A3")}
                    >
                      ← Return to Login
                    </button>
                  ) : (
                    <span style={{ color: "#4A5568" }}>
                      {view === "login" ? "No account? " : "Already registered? "}
                      <button
                        onClick={() => setView(view === "login" ? "signup" : "login")}
                        style={{ color: "#C9A84C" }}
                        className="border-b border-current pb-px ml-1"
                      >
                        {view === "login" ? "Apply Here" : "Login Instead"}
                      </button>
                    </span>
                  )}
                </motion.div>

                {/* Google SSO */}
                {view === "login" && (
                  <motion.div variants={itemVariants} className="pt-2">
                    <div className="relative mb-4">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }} />
                      </div>
                      <div className="relative flex justify-center">
                        <span
                          className="px-4 text-[10px] tracking-[0.2em] uppercase"
                          style={{ background: "rgba(13,20,33,0.85)", color: "#4A5568" }}
                        >
                          Institutional SSO
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={handleGoogle}
                      className="w-full flex items-center justify-center gap-3 rounded-xl text-sm font-medium tracking-wide transition-all"
                      style={{
                        height: "52px",
                        border: "1px solid rgba(255,255,255,0.08)",
                        background: "rgba(17,25,39,0.6)",
                        color: "#F0EDE8",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(201,168,76,0.3)")}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      </svg>
                      Continue with Google Workspaces
                    </button>
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="text-center text-[10px] mt-6 tracking-[0.2em] uppercase leading-relaxed px-4"
          style={{ color: "#4A5568" }}
        >
          Protected by IFXTrades Institutional Security · ISO 27001 · 256-bit SSL
        </motion.p>
      </div>
    </div>
  );
}
