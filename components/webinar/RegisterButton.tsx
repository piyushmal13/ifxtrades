"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-provider";

function formatUsd(amount?: number) {
  if (typeof amount !== "number" || Number.isNaN(amount)) return "";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}

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
    const response = await fetch("/api/checkout/webinar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        webinarId,
        successPath: `/webinars/${webinarSlug}`,
        cancelPath: `/webinars/${webinarSlug}`,
      }),
    });

    const body = await response.json().catch(() => ({}));

    if (!response.ok) {
      setMessage(body.error || "Unable to initialize checkout.");
      return false;
    }

    if (body.checkoutUrl) {
      window.location.assign(body.checkoutUrl);
      return true;
    }

    if (body.ok) {
      setMessage("Registration confirmed.");
      router.refresh();
      return true;
    }

    setMessage("Unable to complete registration right now.");
    return false;
  };

  const handleRegister = async () => {
    if (!session) {
      router.push(`/login?redirect=/webinars/${webinarSlug}`);
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      if (requiresPayment) {
        await startCheckout();
        return;
      }

      const response = await fetch(`/api/webinars/${webinarId}/register`, {
        method: "POST",
      });

      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 402 && body.checkoutRequired) {
          await startCheckout();
          return;
        }

        setMessage(body.error || "Unable to register at this time.");
        return;
      }

      setMessage("Registration confirmed.");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const ctaLabel = requiresPayment
    ? `Secure Checkout ${formatUsd(price)}`.trim()
    : "Register Now";

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        className="btn-primary"
        onClick={handleRegister}
        disabled={disabled || loading}
      >
        {loading ? "Processing..." : disabled ? "Registration Closed" : ctaLabel}
      </button>
      {message && <p className="text-xs text-jpm-muted">{message}</p>}
    </div>
  );
}
