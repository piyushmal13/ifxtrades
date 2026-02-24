"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface OTPVerificationProps {
    email: string;
    onSuccess: () => void;
    onBack: () => void;
}

const COOLDOWNS = [30, 60, 120, 300]; // seconds — exponential

export function OTPVerification({ email, onSuccess, onBack }: OTPVerificationProps) {
    const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [cooldown, setCooldown] = useState(0);
    const [sendCount, setSendCount] = useState(0);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Start initial cooldown on mount
    useEffect(() => {
        startCooldown(0);
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, []);

    const startCooldown = (count: number) => {
        const secs = COOLDOWNS[Math.min(count, COOLDOWNS.length - 1)];
        setCooldown(secs);
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setCooldown((prev) => {
                if (prev <= 1) { clearInterval(timerRef.current!); return 0; }
                return prev - 1;
            });
        }, 1000);
    };

    /* ── Digit input handling ─────────────────────────────────── */

    const handleDigitChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;
        const newDigits = [...digits];
        newDigits[index] = value.slice(-1); // take only last char
        setDigits(newDigits);
        setError(null);
        // Auto-advance
        if (value && index < 5) {
            setTimeout(() => inputRefs.current[index + 1]?.focus(), 0);
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !digits[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
        if (e.key === "ArrowLeft" && index > 0) inputRefs.current[index - 1]?.focus();
        if (e.key === "ArrowRight" && index < 5) inputRefs.current[index + 1]?.focus();
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        if (!pasted) return;
        const newDigits = [...digits];
        pasted.split("").forEach((ch, i) => { if (i < 6) newDigits[i] = ch; });
        setDigits(newDigits);
        // Focus last filled or next empty
        const nextEmpty = newDigits.findIndex((d) => !d);
        inputRefs.current[nextEmpty === -1 ? 5 : nextEmpty]?.focus();
    };

    const code = digits.join("");
    const isComplete = code.length === 6;

    /* ── Verify ─────────────────────────────────────────────────── */

    const handleVerify = useCallback(async () => {
        if (!isComplete || loading) return;
        setLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/auth/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, code }),
            });
            const data = await res.json();

            if (res.ok && data.email_verified) {
                setSuccessMsg("Email verified successfully!");
                setTimeout(onSuccess, 600);
            } else {
                setError(data.error ?? "Verification failed. Please try again.");
                // Clear inputs on wrong code
                setDigits(Array(6).fill(""));
                setTimeout(() => inputRefs.current[0]?.focus(), 0);
            }
        } catch {
            setError("Network error. Please check your connection and try again.");
        } finally {
            setLoading(false);
        }
    }, [email, code, isComplete, loading, onSuccess]);

    // Auto-submit when all 6 digits entered
    useEffect(() => {
        if (isComplete) handleVerify();
    }, [code]); // intentional: run only when code string changes

    /* ── Resend ─────────────────────────────────────────────────── */

    const handleResend = async () => {
        if (cooldown > 0 || resendLoading) return;
        setResendLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/auth/send-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();

            if (res.ok) {
                const newCount = sendCount + 1;
                setSendCount(newCount);
                startCooldown(newCount);
                setSuccessMsg("A new code has been sent to your email.");
                setDigits(Array(6).fill(""));
                setTimeout(() => inputRefs.current[0]?.focus(), 0);
            } else {
                setError(data.error ?? "Failed to resend. Please try again.");
            }
        } catch {
            setError("Network error. Could not resend code.");
        } finally {
            setResendLoading(false);
        }
    };

    /* ── Render ─────────────────────────────────────────────────── */

    return (
        <div className="space-y-6">
            <div className="text-center">
                <div
                    className="w-12 h-12 mx-auto mb-4 rounded-full bg-jpm-gold/10 border border-jpm-gold/30 flex items-center justify-center"
                    aria-hidden="true"
                >
                    <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#d4af37" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                </div>
                <h2 className="text-xl font-serif text-white tracking-tight">Check your email</h2>
                <p className="text-xs text-white/40 mt-1.5 leading-relaxed">
                    We sent a 6-digit code to<br />
                    <span className="text-white/70 font-medium">{email}</span>
                </p>
            </div>

            {/* Status messages */}
            {error && (
                <div role="alert" className="px-3 py-2.5 bg-red-950/30 border border-red-900/50 rounded-md text-xs text-red-300 leading-relaxed text-center">
                    {error}
                </div>
            )}
            {successMsg && !error && (
                <div role="status" aria-live="polite" className="px-3 py-2.5 bg-jpm-gold/8 border border-jpm-gold/20 rounded-md text-xs text-jpm-gold/80 leading-relaxed text-center">
                    {successMsg}
                </div>
            )}

            {/* 6 digit inputs */}
            <div
                className="flex gap-2 justify-center"
                role="group"
                aria-label="6-digit verification code"
                onPaste={handlePaste}
            >
                {digits.map((digit, i) => (
                    <input
                        key={i}
                        ref={(el) => { inputRefs.current[i] = el; }}
                        id={`otp-digit-${i}`}
                        type="text"
                        inputMode="numeric"
                        pattern="\d*"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleDigitChange(i, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(i, e)}
                        aria-label={`Digit ${i + 1} of 6`}
                        autoComplete={i === 0 ? "one-time-code" : "off"}
                        disabled={loading}
                        className={`w-11 h-14 text-center text-2xl font-bold rounded-lg border transition-all duration-[150ms] outline-none
              bg-white/3
              ${digit ? "border-jpm-gold/60 text-jpm-gold shadow-[0_0_12px_rgba(212,175,55,0.2)]" : "border-white/15 text-white"}
              focus:border-jpm-gold/80 focus:ring-2 focus:ring-jpm-gold/25
              disabled:opacity-40 disabled:cursor-not-allowed
            `}
                    />
                ))}
            </div>

            {/* Verify button */}
            <button
                onClick={handleVerify}
                disabled={!isComplete || loading}
                className="btn-base btn-md btn-primary w-full"
                aria-busy={loading}
            >
                {loading ? (
                    <span className="flex items-center justify-center gap-2">
                        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Verifying…
                    </span>
                ) : (
                    "Confirm & Access"
                )}
            </button>

            {/* Resend + cooldown */}
            <div className="text-center space-y-1">
                <button
                    onClick={handleResend}
                    disabled={cooldown > 0 || resendLoading}
                    className="text-xs text-white/35 hover:text-jpm-gold disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
                    aria-live="polite"
                >
                    {cooldown > 0
                        ? `Resend available in ${cooldown}s`
                        : resendLoading
                            ? "Sending…"
                            : "Resend code"}
                </button>
                <br />
                <button
                    onClick={onBack}
                    className="text-[11px] text-white/25 hover:text-white/50 transition-colors"
                >
                    ← Back
                </button>
            </div>
        </div>
    );
}
