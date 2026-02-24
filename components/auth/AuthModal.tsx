"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useAuth } from "@/lib/auth-provider";
import { useToast } from "@/components/ui/Toast";
import { OTPVerification } from "./OTPVerification";

/* ── Types ─────────────────────────────────────────────────── */

type AuthView = "signin" | "signup" | "otp" | "forgot";
type AuthTab = "signin" | "signup";

interface AuthModalProps {
    open: boolean;
    onClose: () => void;
    initialTab?: AuthTab;
    redirectTo?: string;
}

/* ── Helpers ────────────────────────────────────────────────── */

function siteOrigin() {
    if (typeof window !== "undefined") return window.location.origin;
    return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

function callbackUrl(next: string) {
    return `${siteOrigin()}/auth/callback?next=${encodeURIComponent(next)}`;
}

/* ── AuthModal ──────────────────────────────────────────────── */

export function AuthModal({
    open,
    onClose,
    initialTab = "signin",
    redirectTo = "/dashboard",
}: AuthModalProps) {
    const { supabase } = useAuth();
    const { success, error: toastError } = useToast();
    const titleId = useId();
    const panelRef = useRef<HTMLDivElement>(null);
    const lastFocusRef = useRef<Element | null>(null);
    const [mounted, setMounted] = useState(false);

    // View / form state
    const [view, setView] = useState<AuthView>(initialTab === "signup" ? "signup" : "signin");
    const [tab, setTab] = useState<AuthTab>(initialTab);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [loading, setLoading] = useState(false);
    const [emailHint, setEmailHint] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    useEffect(() => setMounted(true), []);

    // Keep view in sync with tab
    useEffect(() => {
        if (view !== "otp" && view !== "forgot") setView(tab);
    }, [tab]);

    // Scroll lock + focus save
    useEffect(() => {
        if (!open) return;
        lastFocusRef.current = document.activeElement;
        document.body.style.overflow = "hidden";
        const t = setTimeout(() => panelRef.current?.focus(), 50);
        return () => {
            clearTimeout(t);
            document.body.style.overflow = "";
            (lastFocusRef.current as HTMLElement | null)?.focus();
        };
    }, [open]);

    // ESC close
    useEffect(() => {
        if (!open) return;
        const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [open, onClose]);

    // Focus trap
    const trapFocus = (e: React.KeyboardEvent) => {
        if (e.key !== "Tab") return;
        const panel = panelRef.current;
        if (!panel) return;
        const sel = 'button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])';
        const focusable = Array.from(panel.querySelectorAll<HTMLElement>(sel));
        const first = focusable[0], last = focusable[focusable.length - 1];
        if (e.shiftKey) { if (document.activeElement === first) { e.preventDefault(); last?.focus(); } }
        else { if (document.activeElement === last) { e.preventDefault(); first?.focus(); } }
    };

    /* ── Email blur: auto-detect existing user ────────────────── */
    const handleEmailBlur = async () => {
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
        try {
            const res = await fetch("/api/auth/check-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const { exists } = await res.json();
            if (exists && tab === "signup") {
                setEmailHint("An account exists with this email. Switching to Sign In.");
                setTab("signin");
            } else if (!exists && tab === "signin") {
                setEmailHint("No account found. Create one below.");
                setTab("signup");
            } else {
                setEmailHint(null);
            }
        } catch {
            setEmailHint(null);
        }
    };

    /* ── Validation ─────────────────────────────────────────────── */
    function validate(): boolean {
        const errors: Record<string, string> = {};
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Enter a valid email address.";
        if (view !== "forgot" && view !== "otp") {
            if (password.length < 8) errors.password = "Password must be at least 8 characters.";
        }
        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    }

    /* ── Sign In ────────────────────────────────────────────────── */
    const handleSignIn = async () => {
        if (!validate()) return;
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            // Check if user is unverified
            if (error.message?.toLowerCase().includes("not confirmed")) {
                setView("otp");
                await fetch("/api/auth/send-otp", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email }),
                });
            } else {
                setFieldErrors({ general: error.message });
            }
        } else {
            success("Signed in", "Welcome back to IFXTrades.");
            onClose();
            window.location.href = redirectTo;
        }
        setLoading(false);
    };

    /* ── Sign Up ────────────────────────────────────────────────── */
    const handleSignUp = async () => {
        if (!validate()) return;
        setLoading(true);

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: fullName },
                emailRedirectTo: callbackUrl(redirectTo),
            },
        });

        if (error) {
            setFieldErrors({ general: error.message });
            setLoading(false);
            return;
        }

        // Send OTP via our endpoint regardless of auto-confirm status
        const sendRes = await fetch("/api/auth/send-otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        });

        if (sendRes.ok) {
            setView("otp");
        } else {
            // User created but OTP failed — still show OTP screen
            setView("otp");
            setFieldErrors({ general: "Account created. Email delivery delayed — resend if needed." });
        }
        setLoading(false);
    };

    /* ── Forgot Password ────────────────────────────────────────── */
    const handleForgot = async () => {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setFieldErrors({ email: "Enter a valid email address." });
            return;
        }
        setLoading(true);
        await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: callbackUrl("/dashboard"),
        });
        success("Reset email sent", "Check your inbox for reset instructions.");
        setView("signin");
        setLoading(false);
    };

    /* ── OTP Success ─────────────────────────────────────────────── */
    const handleOtpSuccess = () => {
        success("Email verified", "Your account is now active. Welcome to IFXTrades!");
        onClose();
        window.location.href = redirectTo;
    };

    /* ── Google OAuth ───────────────────────────────────────────── */
    const handleGoogle = async () => {
        await supabase.auth.signInWithOAuth({
            provider: "google",
            options: { redirectTo: callbackUrl(redirectTo) },
        });
    };

    if (!mounted || !open) return null;

    /* ── Render ─────────────────────────────────────────────────── */
    return createPortal(
        <div
            className="fixed inset-0 z-[9000] flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
            style={{ background: "rgba(2,6,23,0.85)", backdropFilter: "blur(6px)" }}
            aria-label="Authentication dialog overlay"
        >
            <div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                tabIndex={-1}
                className="relative w-full max-w-[440px] outline-none"
                onKeyDown={trapFocus}
            >
                {/* Gold border glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-jpm-gold-dark via-jpm-gold to-transparent opacity-15 rounded-2xl blur-xl pointer-events-none" />

                <div className="relative bg-[#0a0a0a]/90 backdrop-blur-2xl border border-jpm-gold/20 rounded-2xl p-8 shadow-modal">
                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white/25 hover:text-white/70 transition-colors p-1"
                        aria-label="Close authentication dialog"
                    >
                        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {/* Logo */}
                    <div className="flex justify-center mb-6">
                        <Image
                            src="/logo.png"
                            alt="IFXTrades"
                            width={48}
                            height={48}
                            className="rounded-full object-contain"
                            priority
                        />
                    </div>

                    {/* OTP view */}
                    {view === "otp" ? (
                        <OTPVerification
                            email={email}
                            onSuccess={handleOtpSuccess}
                            onBack={() => setView(tab)}
                        />
                    ) : (
                        <>
                            {/* Tabs */}
                            {view !== "forgot" && (
                                <div role="tablist" aria-label="Authentication options" className="flex gap-1 mb-6 p-1 bg-white/3 border border-white/8 rounded-md">
                                    {(["signin", "signup"] as const).map((t) => (
                                        <button
                                            key={t}
                                            role="tab"
                                            aria-selected={tab === t}
                                            onClick={() => { setTab(t); setEmailHint(null); setFieldErrors({}); }}
                                            className={`flex-1 py-2.5 text-[11px] uppercase tracking-[0.1em] font-semibold rounded-sm transition-all duration-[200ms] ${tab === t
                                                ? "bg-jpm-gold/10 text-jpm-gold border border-jpm-gold/25"
                                                : "text-white/40 hover:text-white/70"
                                                }`}
                                        >
                                            {t === "signin" ? "Sign In" : "Create Account"}
                                        </button>
                                    ))}
                                </div>
                            )}

                            <h2 id={titleId} className="text-xl font-serif text-white tracking-tight mb-1 text-center">
                                {view === "forgot" ? "Reset Password" : tab === "signin" ? "Welcome Back" : "Open Your Account"}
                            </h2>
                            <p className="text-xs text-white/35 uppercase tracking-[0.15em] text-center mb-6">
                                Institutional Capital Intelligence
                            </p>

                            {/* Email hint */}
                            {emailHint && (
                                <div className="mb-4 px-3 py-2.5 bg-jpm-gold/8 border border-jpm-gold/20 rounded-md text-xs text-jpm-gold/80 leading-relaxed">
                                    {emailHint}
                                </div>
                            )}

                            {/* General error */}
                            {fieldErrors.general && (
                                <div className="mb-4 px-3 py-2.5 bg-red-950/30 border border-red-900/50 rounded-md text-xs text-red-300 leading-relaxed" role="alert">
                                    {fieldErrors.general}
                                </div>
                            )}

                            <div className="space-y-4">
                                {/* Full Name – signup only */}
                                {tab === "signup" && view !== "forgot" && (
                                    <div>
                                        <label className="field-label mb-1.5 block" htmlFor="modal-name">Full Name</label>
                                        <input
                                            id="modal-name"
                                            type="text"
                                            autoComplete="name"
                                            placeholder="James Whitmore"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            className="input-base"
                                        />
                                    </div>
                                )}

                                {/* Email */}
                                <div>
                                    <label className="field-label mb-1.5 block" htmlFor="modal-email">Email Address</label>
                                    <input
                                        id="modal-email"
                                        type="email"
                                        autoComplete="email"
                                        placeholder="you@institution.com"
                                        value={email}
                                        onChange={(e) => { setEmail(e.target.value); setEmailHint(null); }}
                                        onBlur={handleEmailBlur}
                                        aria-invalid={!!fieldErrors.email}
                                        aria-describedby={fieldErrors.email ? "modal-email-error" : undefined}
                                        className={`input-base ${fieldErrors.email ? "input-error" : ""}`}
                                    />
                                    {fieldErrors.email && <p id="modal-email-error" className="field-error mt-1" role="alert">{fieldErrors.email}</p>}
                                </div>

                                {/* Password */}
                                {view !== "forgot" && (
                                    <div>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <label className="field-label" htmlFor="modal-password">Password</label>
                                            {tab === "signin" && (
                                                <button
                                                    type="button"
                                                    onClick={() => setView("forgot")}
                                                    className="text-[11px] text-white/30 hover:text-jpm-gold transition-colors"
                                                >
                                                    Forgot password?
                                                </button>
                                            )}
                                        </div>
                                        <input
                                            id="modal-password"
                                            type="password"
                                            autoComplete={tab === "signup" ? "new-password" : "current-password"}
                                            placeholder={tab === "signup" ? "Min. 8 characters" : "Your password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            aria-invalid={!!fieldErrors.password}
                                            aria-describedby={fieldErrors.password ? "modal-pw-error" : undefined}
                                            className={`input-base ${fieldErrors.password ? "input-error" : ""}`}
                                        />
                                        {fieldErrors.password && <p id="modal-pw-error" className="field-error mt-1" role="alert">{fieldErrors.password}</p>}
                                    </div>
                                )}

                                {/* CTA Button */}
                                <button
                                    onClick={
                                        view === "forgot" ? handleForgot :
                                            tab === "signin" ? handleSignIn : handleSignUp
                                    }
                                    disabled={loading}
                                    className="btn-base btn-md btn-primary w-full mt-2"
                                    aria-busy={loading}
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                                            {view === "forgot" ? "Sending…" : tab === "signin" ? "Signing In…" : "Creating Account…"}
                                        </span>
                                    ) : (
                                        view === "forgot" ? "Send Reset Instructions" :
                                            tab === "signin" ? "Sign In" : "Create Account"
                                    )}
                                </button>

                                {/* Back from forgot */}
                                {view === "forgot" && (
                                    <button
                                        type="button"
                                        onClick={() => setView("signin")}
                                        className="w-full text-xs text-white/30 hover:text-white/60 transition-colors text-center mt-1"
                                    >
                                        ← Back to Sign In
                                    </button>
                                )}

                                {/* Google SSO divider */}
                                {view !== "forgot" && (
                                    <>
                                        <div className="relative my-2">
                                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/8" /></div>
                                            <div className="relative flex justify-center text-[10px] uppercase tracking-[0.2em]">
                                                <span className="px-3 bg-[#0a0a0a] text-white/25">or continue with</span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleGoogle}
                                            className="w-full border border-white/10 bg-white/3 hover:bg-white/6 text-white/70 py-3 rounded-md transition-all flex items-center justify-center gap-2.5 text-sm"
                                        >
                                            <GoogleIcon />
                                            Google Workspaces
                                        </button>
                                    </>
                                )}
                            </div>

                            {/* Legal */}
                            <p className="mt-5 text-center text-[10px] text-white/20 leading-relaxed">
                                By continuing you agree to our{" "}
                                <a href="/legal" className="text-white/35 hover:text-white/60">Terms</a>{" "}
                                and{" "}
                                <a href="/legal#privacy" className="text-white/35 hover:text-white/60">Privacy Policy</a>.
                                Capital at risk.
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>,
        document.body,
    );
}

function GoogleIcon() {
    return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
    );
}
