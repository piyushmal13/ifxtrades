"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { OTPVerification } from "@/components/auth/OTPVerification";

function VerifyContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const emailParam = searchParams.get("email") ?? "";
    const redirectTo = searchParams.get("redirect") ?? "/dashboard";

    const [email, setEmail] = useState(emailParam);
    const [emailInput, setEmailInput] = useState("");
    const [step, setStep] = useState<"email" | "otp">(emailParam ? "otp" : "email");
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSendOtp = async () => {
        const target = email || emailInput;
        if (!target) { setError("Please enter your email address."); return; }
        setSending(true);
        setError(null);
        const res = await fetch("/api/auth/send-otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: target }),
        });
        if (res.ok) {
            setEmail(target);
            setStep("otp");
        } else {
            const data = await res.json();
            setError(data.error ?? "Failed to send code.");
        }
        setSending(false);
    };

    const handleSuccess = () => {
        router.push(redirectTo);
    };

    return (
        <main className="min-h-screen bg-[#020617] flex items-center justify-center px-4">
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_0%,rgba(212,175,55,0.06),transparent)] pointer-events-none" />
            <div className="relative z-10 w-full max-w-[400px]">
                <div className="card border border-jpm-gold/15 bg-[#0a0a0a]/90 p-8">
                    {step === "email" ? (
                        <div className="space-y-5">
                            <div className="text-center">
                                <div className="w-11 h-11 mx-auto mb-4 rounded-full bg-jpm-gold/10 border border-jpm-gold/30 flex items-center justify-center">
                                    <span className="font-serif italic text-jpm-gold text-lg font-bold tracking-widest ml-0.5">IFX</span>
                                </div>
                                <h1 className="font-serif text-xl text-white">Verify Your Email</h1>
                                <p className="text-xs text-white/40 mt-1.5 leading-relaxed">
                                    Your account needs email verification before you can access the platform.
                                </p>
                            </div>

                            {error && (
                                <div role="alert" className="px-3 py-2.5 bg-red-950/30 border border-red-900/50 rounded-md text-xs text-red-300">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label htmlFor="verify-email" className="field-label mb-1.5 block">Email Address</label>
                                <input
                                    id="verify-email"
                                    type="email"
                                    autoComplete="email"
                                    placeholder="you@institution.com"
                                    value={emailInput}
                                    onChange={(e) => setEmailInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                                    className="input-base"
                                />
                            </div>

                            <button
                                onClick={handleSendOtp}
                                disabled={sending}
                                className="btn-base btn-md btn-primary w-full"
                                aria-busy={sending}
                            >
                                {sending ? "Sending code…" : "Send Verification Code"}
                            </button>
                        </div>
                    ) : (
                        <OTPVerification
                            email={email}
                            onSuccess={handleSuccess}
                            onBack={() => { setStep("email"); setEmail(""); }}
                        />
                    )}
                </div>

                <p className="mt-5 text-center text-[10px] text-white/25 leading-relaxed">
                    IFXTrades · Institutional Capital Intelligence<br />
                    For support: security@ifxtrades.com
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
