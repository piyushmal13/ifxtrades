"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { OTPVerification } from "@/components/auth/OTPVerification";
import { useAuth } from "@/lib/auth-provider";
import { getAuthCallbackUrl } from "@/lib/site";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function VerifyContent() {
  const { supabase } = useAuth();
  const searchParams = useSearchParams();

  const redirectParam = searchParams.get("redirect");
  const redirectTo = redirectParam && redirectParam.startsWith("/") ? redirectParam : "/dashboard";

  const emailParam = (searchParams.get("email") ?? "").trim().toLowerCase();
  const [email, setEmail] = useState(emailParam);
  const [emailInput, setEmailInput] = useState(emailParam);
  const [step, setStep] = useState<"email" | "otp">(emailParam ? "otp" : "email");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendVerification = async () => {
    const target = (email || emailInput).trim().toLowerCase();

    if (!EMAIL_RE.test(target)) {
      setError("Please enter a valid email address.");
      return;
    }

    setSending(true);
    setError(null);

    try {
      const { error: resendError } = await supabase.auth.resend({
        type: "signup",
        email: target,
        options: {
          emailRedirectTo: getAuthCallbackUrl(redirectTo),
        },
      });

      if (resendError) {
        setError(resendError.message);
        return;
      }

      setEmail(target);
      setStep("otp");
    } catch {
      setError("Unable to send verification right now.");
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#020617] flex items-center justify-center px-4">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_0%,rgba(212,175,55,0.06),transparent)] pointer-events-none" />
      <div className="relative z-10 w-full max-w-[420px]">
        <div className="card border border-ifx-gold/15 bg-[#0a0a0a]/90 p-8">
          {step === "email" ? (
            <div className="space-y-5">
              <div className="text-center">
                <div className="w-11 h-11 mx-auto mb-4 rounded-full bg-ifx-gold/10 border border-ifx-gold/30 flex items-center justify-center">
                  <span className="font-serif text-ifx-gold text-lg font-bold tracking-widest">IFX</span>
                </div>
                <h1 className="font-serif text-xl text-white">Verify your email</h1>
                <p className="text-xs text-white/40 mt-1.5 leading-relaxed">
                  Enter your account email. We will send verification instructions.
                </p>
              </div>

              {error && (
                <div role="alert" className="px-3 py-2.5 bg-red-950/30 border border-red-900/50 rounded-md text-xs text-red-300">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="verify-email" className="field-label mb-1.5 block">
                  Email Address
                </label>
                <input
                  id="verify-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@institution.com"
                  value={emailInput}
                  onChange={(event) => setEmailInput(event.target.value)}
                  onKeyDown={(event) => event.key === "Enter" && handleSendVerification()}
                  className="input-base"
                />
              </div>

              <button
                onClick={handleSendVerification}
                disabled={sending}
                className="btn-base btn-md btn-primary w-full"
                aria-busy={sending}
              >
                {sending ? "Sending..." : "Send verification"}
              </button>
            </div>
          ) : (
            <OTPVerification
              email={email}
              redirectTo={redirectTo}
              onBack={() => {
                setStep("email");
                setError(null);
              }}
            />
          )}
        </div>

        <p className="mt-5 text-center text-[10px] text-white/25 leading-relaxed">
          IFXTrades Institutional Security
          <br />
          Support: security@ifxtrades.com
        </p>
      </div>
    </main>
  );
}

export default function VerifyPage() {
  return (
    <Suspense>
      <VerifyContent />
    </Suspense>
  );
}
