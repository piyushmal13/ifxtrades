"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth-provider";
import { containerVariants, itemVariants, GRAVITY } from "@/lib/animations";
import { getAuthCallbackUrl } from "@/lib/site";

type View = "login" | "signup" | "forgotPassword";
type Msg = { text: string; type: "success" | "error" };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_RE = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export default function LoginClient({ initialView = "login" }: { initialView?: View }) {
  const { supabase } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirectParam = searchParams.get("redirect");
  const redirectAfterAuth = redirectParam && redirectParam.startsWith("/") ? redirectParam : "/dashboard";

  const callbackError = searchParams.get("error");

  const [view, setView] = useState<View>(initialView);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<Msg | null>(null);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    if (!callbackError) return;
    setMessage({ text: callbackError, type: "error" });
  }, [callbackError]);

  const validateEmail = useCallback((value: string) => {
    if (!EMAIL_RE.test(value)) {
      setEmailError("Please enter a valid email address.");
      return false;
    }
    setEmailError("");
    return true;
  }, []);

  const validatePassword = useCallback((value: string) => {
    if (!PASSWORD_RE.test(value)) {
      setPasswordError("Min 8 chars, 1 uppercase, 1 number, 1 special character.");
      return false;
    }
    setPasswordError("");
    return true;
  }, []);

  const title = useMemo(() => {
    if (view === "signup") return "Request Access";
    if (view === "forgotPassword") return "Reset Credentials";
    return "Welcome Back";
  }, [view]);

  const handleLogin = async () => {
    if (!validateEmail(email)) return;

    setLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (!error) {
      router.push(redirectAfterAuth);
      router.refresh();
      setLoading(false);
      return;
    }

    const msg = error.message?.toLowerCase() ?? "";
    if (msg.includes("confirm") || msg.includes("verify")) {
      router.push(`/verify?email=${encodeURIComponent(email)}&redirect=${encodeURIComponent(redirectAfterAuth)}`);
      setLoading(false);
      return;
    }

    setMessage({ text: error.message, type: "error" });
    setLoading(false);
  };

  const handleSignup = async () => {
    const emailOk = validateEmail(email);
    const passwordOk = validatePassword(password);
    if (!emailOk || !passwordOk) return;

    setLoading(true);
    setMessage(null);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName.trim() },
        emailRedirectTo: getAuthCallbackUrl(redirectAfterAuth),
      },
    });

    if (error) {
      setMessage({ text: error.message, type: "error" });
      setLoading(false);
      return;
    }

    if (data.session) {
      router.push(redirectAfterAuth);
      router.refresh();
      setLoading(false);
      return;
    }

    router.push(`/verify?email=${encodeURIComponent(email)}&redirect=${encodeURIComponent(redirectAfterAuth)}`);
    setLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!validateEmail(email)) return;

    setLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: getAuthCallbackUrl("/dashboard"),
    });

    if (error) {
      setMessage({ text: error.message, type: "error" });
    } else {
      setMessage({ text: "Password reset instructions sent. Check your inbox.", type: "success" });
    }

    setLoading(false);
  };

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: getAuthCallbackUrl(redirectAfterAuth),
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden" style={{ backgroundColor: "#080C14" }}>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 70% 40% at 50% 50%, rgba(201,168,76,0.07) 0%, transparent 70%)",
        }}
      />

      <motion.div
        className="absolute top-[-15%] left-[-10%] w-[45%] h-[45%] rounded-full blur-[120px]"
        style={{ background: "rgba(201,168,76,0.06)" }}
        animate={{ x: [0, 40, 0], y: [0, 25, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute bottom-[-15%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[100px]"
        style={{ background: "rgba(201,168,76,0.04)" }}
        animate={{ x: [0, -30, 0], y: [0, -20, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 3 }}
      />

      <div className="relative z-10 w-full max-w-[480px]">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, ease: GRAVITY }}
          className="rounded-2xl p-8 md:p-12 w-full"
          style={{
            background: "rgba(13, 20, 33, 0.85)",
            backdropFilter: "blur(24px) saturate(180%)",
            border: "1px solid rgba(255,255,255,0.07)",
            boxShadow: "0 32px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
          }}
        >
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
            <motion.div variants={itemVariants} className="flex justify-center">
              <Image src="/logo.png" alt="IFXTrades" width={56} height={56} className="rounded-full object-contain" priority />
            </motion.div>

            <motion.div variants={itemVariants} className="text-center">
              <h1 className="font-serif font-semibold mb-1" style={{ fontSize: "32px", color: "#C9A84C", letterSpacing: "-0.01em" }}>
                {title}
              </h1>
              <p className="text-xs tracking-[0.2em] uppercase" style={{ color: "#4A5568" }}>
                Institutional Capital Intelligence
              </p>
            </motion.div>

            {message && (
              <motion.div
                key={message.text}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
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

            <div className="space-y-4">
              {view === "signup" && (
                <motion.div variants={itemVariants}>
                  <input
                    className="w-full rounded-xl text-sm outline-none px-4"
                    style={{ height: "52px", background: "rgba(17,25,39,0.8)", border: "1px solid rgba(255,255,255,0.08)", color: "#F0EDE8" }}
                    placeholder="Full Name"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                  />
                </motion.div>
              )}

              <motion.div variants={itemVariants}>
                <input
                  type="email"
                  className="w-full rounded-xl text-sm outline-none px-4"
                  style={{
                    height: "52px",
                    background: "rgba(17,25,39,0.8)",
                    border: `1px solid ${emailError ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.08)"}`,
                    color: "#F0EDE8",
                  }}
                  placeholder="Corporate or Personal Email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    if (emailError) validateEmail(event.target.value);
                  }}
                  onBlur={(event) => validateEmail(event.target.value)}
                />
                {emailError && <p className="mt-1 text-xs" style={{ color: "#EF4444" }}>{emailError}</p>}
              </motion.div>

              {view !== "forgotPassword" && (
                <motion.div variants={itemVariants} className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    className="w-full rounded-xl text-sm outline-none px-4 pr-12"
                    style={{
                      height: "52px",
                      background: "rgba(17,25,39,0.8)",
                      border: `1px solid ${passwordError ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.08)"}`,
                      color: "#F0EDE8",
                    }}
                    placeholder={view === "signup" ? "Password (8+ chars, uppercase, number, special)" : "Password"}
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      if (passwordError && view === "signup") {
                        validatePassword(event.target.value);
                      }
                    }}
                    onBlur={() => {
                      if (view === "signup") {
                        validatePassword(password);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((current) => !current)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs tracking-wide"
                    style={{ color: "#4A5568" }}
                  >
                    {showPw ? "HIDE" : "SHOW"}
                  </button>
                  {passwordError && <p className="mt-1 text-xs" style={{ color: "#EF4444" }}>{passwordError}</p>}
                </motion.div>
              )}

              {view === "login" && (
                <motion.div variants={itemVariants} className="flex justify-end">
                  <button
                    onClick={() => setView("forgotPassword")}
                    className="text-xs tracking-wider transition-colors"
                    style={{ color: "#8A95A3" }}
                  >
                    Forgot Password?
                  </button>
                </motion.div>
              )}

              <motion.div variants={itemVariants}>
                <button
                  onClick={view === "login" ? handleLogin : view === "signup" ? handleSignup : handleForgotPassword}
                  disabled={loading}
                  className="w-full rounded-xl font-bold text-sm tracking-widest uppercase transition-all disabled:opacity-50"
                  style={{
                    height: "52px",
                    background: "linear-gradient(135deg, #8B6914 0%, #C9A84C 50%, #E6C97A 100%)",
                    color: "#080C14",
                  }}
                >
                  {loading
                    ? "Processing..."
                    : view === "login"
                      ? "Access Workspace"
                      : view === "signup"
                        ? "Create Account"
                        : "Send Reset Instructions"}
                </button>
              </motion.div>

              <motion.div variants={itemVariants} className="text-center text-xs tracking-wider uppercase">
                {view === "forgotPassword" ? (
                  <button
                    onClick={() => setView("login")}
                    style={{ color: "#8A95A3" }}
                  >
                    Return to Login
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

              {view === "login" && (
                <motion.div variants={itemVariants} className="pt-2">
                  <div className="relative mb-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }} />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="px-4 text-[10px] tracking-[0.2em] uppercase" style={{ background: "rgba(13,20,33,0.85)", color: "#4A5568" }}>
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
                  >
                    Continue with Google Workspaces
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="text-center text-[10px] mt-6 tracking-[0.2em] uppercase leading-relaxed px-4"
          style={{ color: "#4A5568" }}
        >
          Protected by IFXTrades Institutional Security - ISO 27001 - 256-bit SSL
        </motion.p>
      </div>
    </div>
  );
}
