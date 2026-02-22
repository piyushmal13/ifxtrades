"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-provider";

export default function RegisterButton({
  webinarId,
  webinarSlug,
  disabled,
}: {
  webinarId: string;
  webinarSlug: string;
  disabled?: boolean;
}) {
  const router = useRouter();
  const { session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleRegister = async () => {
    if (!session) {
      router.push(`/login?redirect=/webinars/${webinarSlug}`);
      return;
    }

    setLoading(true);
    setMessage(null);

    const response = await fetch(`/api/webinars/${webinarId}/register`, {
      method: "POST",
    });
    const body = await response.json().catch(() => ({}));

    if (!response.ok) {
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
        {loading ? "Submitting..." : "Register"}
      </button>
      {message && <p className="text-xs text-jpm-muted">{message}</p>}
    </div>
  );
}
