"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-provider";

function formatUsd(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}

export default function BuyLicenseButton({
  algoId,
  algoSlug,
  price,
}: {
  algoId: string;
  algoSlug: string;
  price: number;
}) {
  const { session } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const startCheckout = async () => {
    if (!session) {
      router.push(`/login?redirect=/algos/${algoSlug}`);
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/checkout/algo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          algoId,
          successPath: "/dashboard/licenses",
          cancelPath: `/algos/${algoSlug}`,
        }),
      });

      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        setMessage(body.error || "Checkout failed.");
        return;
      }

      if (body.checkoutUrl) {
        window.location.assign(body.checkoutUrl);
        return;
      }

      if (body.type === "free_license") {
        setMessage("License activated.");
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6">
      <button type="button" className="btn-primary" onClick={startCheckout} disabled={loading}>
        {loading
          ? "Processing..."
          : price > 0
            ? `Buy License (${formatUsd(price)})`
            : "Activate License"}
      </button>
      {message && <p className="text-xs text-jpm-muted mt-2">{message}</p>}
    </div>
  );
}
