"use client";

import React, { useEffect, useState } from "react";

type Status = "operational" | "degraded" | "outage" | "maintenance";

interface StatusIndicatorProps {
    status?: Status;
    label?: string;
    showLabel?: boolean;
    className?: string;
}

const STATUS_CONFIG: Record<Status, { color: string; pulse: string; text: string }> = {
    operational: { color: "bg-emerald-400", pulse: "bg-emerald-400/40", text: "All Systems Operational" },
    degraded: { color: "bg-amber-400", pulse: "bg-amber-400/40", text: "Partial Degradation" },
    outage: { color: "bg-red-400", pulse: "bg-red-400/40", text: "Service Outage" },
    maintenance: { color: "bg-blue-400", pulse: "bg-blue-400/40", text: "Scheduled Maintenance" },
};

export function StatusIndicator({
    status = "operational",
    label,
    showLabel = true,
    className = "",
}: StatusIndicatorProps) {
    const { color, pulse, text } = STATUS_CONFIG[status];
    const displayLabel = label ?? text;

    return (
        <div
            className={`flex items-center gap-2 ${className}`}
            role="status"
            aria-label={`Platform status: ${displayLabel}`}
        >
            {/* Pulsing dot */}
            <div className="relative flex items-center justify-center w-2.5 h-2.5" aria-hidden="true">
                <span className={`absolute inline-flex h-full w-full rounded-full opacity-60 animate-ping ${pulse}`} />
                <span className={`relative inline-flex rounded-full h-2 w-2 ${color}`} />
            </div>

            {showLabel && (
                <span className="text-[10px] uppercase tracking-[0.15em] font-semibold text-white/40">
                    {displayLabel}
                </span>
            )}
        </div>
    );
}

/** Live status that fetches from a simple status endpoint (optional) */
export function LiveStatusIndicator({ className }: { className?: string }) {
    const [status, setStatus] = useState<Status>("operational");

    // If you have a /api/status endpoint, fetch it here
    // useEffect(() => {
    //   fetch("/api/status")
    //     .then((r) => r.json())
    //     .then((d) => setStatus(d.status))
    //     .catch(() => {});
    // }, []);

    return <StatusIndicator status={status} className={className} />;
}
