"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/lib/auth-provider";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Tooltip } from "@/components/ui/Tooltip";
import { useToast } from "@/components/ui/Toast";
import { getAuthCallbackUrl } from "@/lib/site";

type InvestorType = "retail" | "professional" | "institutional";

function getPasswordStrength(password: string): { level: 0 | 1 | 2 | 3; label: string } {
  if (password.length === 0) return { level: 0, label: "" };

  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  const labels = ["", "Weak", "Moderate", "Strong"] as const;
  return { level: score as 0 | 1 | 2 | 3, label: labels[score] };
}

function PasswordStrengthBar({ strength }: { strength: 0 | 1 | 2 | 3 }) {
  return (
    <div className="strength-bar" aria-hidden="true">
      {[1, 2, 3].map((index) => (
        <div
          key={index}
          className={`strength-segment ${index <= strength ? (strength === 1 ? "weak" : strength === 2 ? "medium" : "strong") : ""}`}
        />
      ))}
    </div>
  );
}

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="step-indicator w-full max-w-xs mx-auto mb-10" aria-label={`Step ${current} of ${total}`}>
      {Array.from({ length: total }).map((_, index) => (
        <div key={index} className="flex items-center flex-1">
          <div className={`step-dot ${index + 1 === current ? "active" : index + 1 < current ? "complete" : ""}`}>
            {index + 1 < current ? (
              <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              index + 1
            )}
          </div>
          {index < total - 1 && <div className={`step-line ${index + 1 < current ? "complete" : ""}`} />}
        </div>
      ))}
    </div>
  );
}

const INVESTOR_TYPES: { value: InvestorType; label: string; desc: string }[] = [
  { value: "retail", label: "Retail Investor", desc: "Individual trading with personal capital" },
  { value: "professional", label: "Professional Investor", desc: "Meets professional investor criteria" },
  { value: "institutional", label: "Institutional Entity", desc: "Fund, family office, or corporate treasury" },
];

export function SignupClient() {
  const { supabase } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { success, error: toastError } = useToast();

  const redirectParam = searchParams.get("redirect");
  const redirectAfterAuth = redirectParam && redirectParam.startsWith("/") ? redirectParam : "/dashboard";

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [country, setCountry] = useState("");
  const [firstNameError, setFirstNameError] = useState("");

  const [investorType, setInvestorType] = useState<InvestorType>("retail");
  const [agreed, setAgreed] = useState(false);
  const [agreedError, setAgreedError] = useState("");

  const passwordStrength = getPasswordStrength(password);

  const validateStep1 = () => {
    let valid = true;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Please enter a valid email address.");
      valid = false;
    } else {
      setEmailError("");
    }

    if (!/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password)) {
      setPasswordError("Password must include 8+ chars, one uppercase, one number, and one special character.");
      valid = false;
    } else {
      setPasswordError("");
    }

    return valid;
  };

  const validateStep2 = () => {
    if (!firstName.trim()) {
      setFirstNameError("First name is required.");
      return false;
    }

    setFirstNameError("");
    return true;
  };

  const validateStep3 = () => {
    if (!agreed) {
      setAgreedError("You must accept the terms to continue.");
      return false;
    }

    setAgreedError("");
    return true;
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep((current) => current + 1);
  };

  const handleSubmit = async () => {
    if (!validateStep3()) return;

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            country,
            investor_type: investorType,
            full_name: `${firstName} ${lastName}`.trim(),
          },
          emailRedirectTo: getAuthCallbackUrl(redirectAfterAuth),
        },
      });

      if (error) {
        toastError("Signup failed", error.message);
        return;
      }

      if (data.session) {
        success("Account created", "You are now signed in.");
        router.push(redirectAfterAuth);
        router.refresh();
        return;
      }

      // Supabase may require email confirmation before session creation.
      success("Account created", "Verify your email to continue.");
      router.push(`/verify?email=${encodeURIComponent(email)}&redirect=${encodeURIComponent(redirectAfterAuth)}`);
    } catch {
      toastError("Unexpected error", "Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center px-4 py-16">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_0%,rgba(212,175,55,0.06),transparent)] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <p className="text-[10px] uppercase tracking-[0.3em] text-ifx-gold/70 mb-2">Institutional Access</p>
          <h1 className="font-serif text-3xl text-white mb-2">Open Your Account</h1>
          <p className="text-sm text-white/40">
            {step === 1 ? "Create your credentials" : step === 2 ? "Tell us about yourself" : "Select your access level"}
          </p>
        </div>

        <StepIndicator current={step} total={3} />

        <div className="card border border-white/10 bg-white/3 backdrop-blur-md p-8">
          {step === 1 && (
            <div className="space-y-5">
              <Input
                label="Email Address"
                type="email"
                placeholder="you@institution.com"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                error={emailError}
                required
              />

              <div>
                <Input
                  label="Password"
                  type="password"
                  placeholder="8+ chars, uppercase, number, special char"
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  error={passwordError}
                  required
                />
                {password && (
                  <div className="mt-2">
                    <PasswordStrengthBar strength={passwordStrength.level} />
                    {passwordStrength.label && (
                      <p className={`text-[10px] mt-1 font-medium ${passwordStrength.level === 1 ? "text-red-400" : passwordStrength.level === 2 ? "text-amber-400" : "text-emerald-400"}`}>
                        {passwordStrength.label} password
                      </p>
                    )}
                  </div>
                )}
              </div>

              <Button fullWidth onClick={handleNext}>
                Continue
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  type="text"
                  placeholder="James"
                  autoComplete="given-name"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  error={firstNameError}
                  required
                />
                <Input
                  label="Last Name"
                  type="text"
                  placeholder="Whitmore"
                  autoComplete="family-name"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                />
              </div>

              <div>
                <label className="field-label mb-2 block">Country / Jurisdiction</label>
                <select
                  value={country}
                  onChange={(event) => setCountry(event.target.value)}
                  autoComplete="country-name"
                  className="input-base"
                >
                  <option value="">Select your country...</option>
                  <option value="US">United States</option>
                  <option value="GB">United Kingdom</option>
                  <option value="AU">Australia</option>
                  <option value="SG">Singapore</option>
                  <option value="AE">UAE</option>
                  <option value="IN">India</option>
                  <option value="DE">Germany</option>
                  <option value="CA">Canada</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="ghost" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button fullWidth onClick={handleNext}>
                  Continue
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <p className="field-label mb-3">Investor Classification</p>

              <div className="space-y-3" role="radiogroup" aria-label="Investor type">
                {INVESTOR_TYPES.map((type) => (
                  <label
                    key={type.value}
                    className={`flex items-start gap-3 p-4 rounded-md border cursor-pointer transition-all duration-200 ${
                      investorType === type.value
                        ? "border-ifx-gold/50 bg-[rgba(212,175,55,0.06)]"
                        : "border-white/10 bg-white/2 hover:border-white/20"
                    }`}
                  >
                    <input
                      type="radio"
                      name="investorType"
                      value={type.value}
                      checked={investorType === type.value}
                      onChange={() => setInvestorType(type.value)}
                      className="mt-0.5 accent-ifx-gold"
                    />
                    <div>
                      <p className="text-sm font-semibold text-white">{type.label}</p>
                      <p className="text-xs text-white/40 mt-0.5">{type.desc}</p>
                    </div>
                  </label>
                ))}
              </div>

              <div className="flex items-center gap-2 mt-2">
                <p className="text-xs text-white/35 leading-relaxed">
                  Identity verification may be required based on your access tier.
                </p>
                <Tooltip content="Verification ensures regulatory compliance and unlocks institutional-tier access.">
                  <button
                    type="button"
                    className="text-white/25 hover:text-ifx-gold/70 transition-colors shrink-0"
                    aria-label="KYC information"
                  >
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                </Tooltip>
              </div>

              <div>
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(event) => {
                      setAgreed(event.target.checked);
                      setAgreedError("");
                    }}
                    className="mt-0.5 accent-ifx-gold"
                    aria-describedby={agreedError ? "agree-error" : undefined}
                  />
                  <span className="text-xs text-white/45 leading-relaxed group-hover:text-white/60 transition-colors">
                    I agree to the
                    <Link href="/legal" className="text-ifx-gold/70 hover:text-ifx-gold underline-offset-2 hover:underline ml-1 mr-1">
                      Terms & Conditions
                    </Link>
                    and
                    <Link href="/legal#privacy" className="text-ifx-gold/70 hover:text-ifx-gold underline-offset-2 hover:underline ml-1 mr-1">
                      Privacy Policy
                    </Link>
                    and understand trading carries risk.
                  </span>
                </label>
                {agreedError && (
                  <p id="agree-error" className="field-error mt-2" role="alert">
                    {agreedError}
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="ghost" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button fullWidth loading={loading} onClick={handleSubmit}>
                  Open Your Account
                </Button>
              </div>

              <p className="text-center text-[10px] text-white/25 mt-2">
                Secure SSL - No card required - Cancel anytime
              </p>
            </div>
          )}
        </div>

        <p className="text-center mt-6 text-xs text-white/30">
          Already have an account?
          <Link href="/login" className="text-ifx-gold/70 hover:text-ifx-gold transition-colors hover:underline underline-offset-4 ml-1">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}
