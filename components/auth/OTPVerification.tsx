"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-provider";
import { getAuthCallbackUrl } from "@/lib/site";

interface OTPVerificationProps {
  email: string;
  redirectTo: string;
  onBack: () => void;
}

const COOLDOWNS = [30, 60, 120, 300] as const;

export function OTPVerification({ email, redirectTo, onBack }: OTPVerificationProps) {
  const router = useRouter();
  const { supabase } = useAuth();

  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [sendCount, setSendCount] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startCooldown = useCallback((count: number) => {
    const seconds = COOLDOWNS[Math.min(count, COOLDOWNS.length - 1)];
    setCooldown(seconds);

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const code = useMemo(() => digits.join(""), [digits]);
  const isComplete = code.length === 6;

  const handleDigitChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const next = [...digits];
    next[index] = value.slice(-1);
    setDigits(next);
    setError(null);

    if (value && index < 5) {
      setTimeout(() => inputRefs.current[index + 1]?.focus(), 0);
    }
  };

  const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (event.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (event.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (event: React.ClipboardEvent) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;

    const next = Array(6).fill("");
    pasted.split("").forEach((char, index) => {
      next[index] = char;
    });

    setDigits(next);
    const focusIndex = Math.min(pasted.length, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleVerify = useCallback(async () => {
    if (!isComplete || loading) return;

    setLoading(true);
    setError(null);
    setNotice(null);

    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: "signup",
      });

      if (verifyError) {
        setError(verifyError.message);
        setDigits(Array(6).fill(""));
        setTimeout(() => inputRefs.current[0]?.focus(), 0);
        return;
      }

      setNotice("Verification successful. Redirecting...");
      router.push(redirectTo);
      router.refresh();
    } catch {
      setError("Unable to verify right now. Please retry.");
    } finally {
      setLoading(false);
    }
  }, [code, email, isComplete, loading, redirectTo, router, supabase]);

  const handleResend = useCallback(async () => {
    if (cooldown > 0 || resendLoading) return;

    setResendLoading(true);
    setError(null);
    setNotice(null);

    try {
      const { error: resendError } = await supabase.auth.resend({
        type: "signup",
        email,
        options: {
          emailRedirectTo: getAuthCallbackUrl(redirectTo),
        },
      });

      if (resendError) {
        setError(resendError.message);
        return;
      }

      const nextSendCount = sendCount + 1;
      setSendCount(nextSendCount);
      startCooldown(nextSendCount - 1);
      setNotice("A new verification message was sent.");
    } catch {
      setError("Unable to resend right now.");
    } finally {
      setResendLoading(false);
    }
  }, [cooldown, email, redirectTo, resendLoading, sendCount, startCooldown, supabase]);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-serif text-white tracking-tight">Verify your account</h2>
        <p className="text-xs text-white/45 mt-2 leading-relaxed">
          Enter the 6-digit code sent to
          <br />
          <span className="text-white/75 font-medium">{email}</span>
        </p>
      </div>

      {error && (
        <div role="alert" className="px-3 py-2.5 bg-red-950/30 border border-red-900/50 rounded-md text-xs text-red-300 text-center">
          {error}
        </div>
      )}

      {notice && !error && (
        <div role="status" className="px-3 py-2.5 bg-jpm-gold/8 border border-jpm-gold/20 rounded-md text-xs text-jpm-gold/80 text-center">
          {notice}
        </div>
      )}

      <div className="flex gap-2 justify-center" role="group" aria-label="6-digit verification code" onPaste={handlePaste}>
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            pattern="\d*"
            maxLength={1}
            value={digit}
            onChange={(event) => handleDigitChange(index, event.target.value)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            aria-label={`Digit ${index + 1} of 6`}
            autoComplete={index === 0 ? "one-time-code" : "off"}
            disabled={loading}
            className={`w-11 h-14 text-center text-2xl font-bold rounded-lg border transition-all duration-150 outline-none bg-white/3 ${
              digit
                ? "border-jpm-gold/60 text-jpm-gold shadow-[0_0_12px_rgba(212,175,55,0.2)]"
                : "border-white/15 text-white"
            } focus:border-jpm-gold/80 focus:ring-2 focus:ring-jpm-gold/25 disabled:opacity-40 disabled:cursor-not-allowed`}
          />
        ))}
      </div>

      <button
        onClick={handleVerify}
        disabled={!isComplete || loading}
        className="btn-base btn-md btn-primary w-full"
        aria-busy={loading}
      >
        {loading ? "Verifying..." : "Confirm and continue"}
      </button>

      <div className="text-center space-y-1">
        <button
          onClick={handleResend}
          disabled={cooldown > 0 || resendLoading}
          className="text-xs text-white/35 hover:text-jpm-gold disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
        >
          {cooldown > 0
            ? `Resend available in ${cooldown}s`
            : resendLoading
              ? "Sending..."
              : "Resend verification"}
        </button>
        <br />
        <button
          onClick={onBack}
          className="text-[11px] text-white/25 hover:text-white/50 transition-colors"
        >
          Back
        </button>
      </div>

      <p className="text-[11px] text-white/30 text-center leading-relaxed">
        If your email contains a verification link, opening that link also completes signup.
      </p>
    </div>
  );
}
