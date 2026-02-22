"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-provider";

export default function RegisterButton({
  webinarId,
  webinarSlug,
  requiresPayment,
  price,
  disabled,
}: {
  webinarId: string;
  webinarSlug: string;
  requiresPayment?: boolean;
  price?: number;
  disabled?: boolean;
}) {
  const router = useRouter();
  const { session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const startCheckout = async () => {
    const checkoutResponse = await fetch("/api/checkout/webinar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        webinarId,
        successPath: `/webinars/${webinarSlug}`,
        cancelPath: `/webinars/${webinarSlug}`,
      }),
    });
    const checkoutBody = await checkoutResponse.json().catch(() => ({}));

    if (!checkoutResponse.ok) {
      setMessage(checkoutBody.error || "Unable to initialize checkout.");
      return false;
    }

    if (checkoutBody.checkoutUrl) {
      window.location.assign(checkoutBody.checkoutUrl);
      return true;
    }

    if (checkoutBody.ok) {
      setMessage("Registration confirmed.");
      router.refresh();
      return true;
    }

    return false;
  };

  const handleRegister = async () => {
    if (!session) {
      router.push(`/login?redirect=/webinars/${webinarSlug}`);
      return;
    }

    setLoading(true);
    setMessage(null);

    if (requiresPayment) {
      await startCheckout();
      setLoading(false);
      return;
    }

    const response = await fetch(`/api/webinars/${webinarId}/register`, {
      method: "POST",
    });
    const body = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (response.status === 402 && body.checkoutRequired) {
        await startCheckout();
        setLoading(false);
        return;
      }
      setMessage(body.error || "Unable to register at this time.");
      setLoading(false);
      return;
    }

    setMessage("Registration confirmed.");
    setLoading(false);
    router.refresh();
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        className="btn-primary"
        onClick={handleRegister}
        disabled={disabled || loading}
      >
        {loading
          ? "Submitting..."
          : requiresPayment
            ? `Pay ${typeof price === "number" && price > 0 ? `$${price}` : ""}`.trim()
            : "Register"}
      </button>
      {message && <p className="text-xs text-jpm-muted">{message}</p>}
    </div>
  );
}
