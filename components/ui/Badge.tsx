import React from "react";

type BadgeVariant = "live" | "premium" | "verified" | "pending" | "closed" | "neutral" | "success" | "error";

interface BadgeProps {
    variant?: BadgeVariant;
    children: React.ReactNode;
    pulse?: boolean;
    className?: string;
}

const variantClass: Record<BadgeVariant, string> = {
    live: "badge-live",
    premium: "badge-premium",
    verified: "badge-verified",
    pending: "badge-pending",
    closed: "badge-closed",
    neutral: "badge-neutral",
    success: "badge-live",
    error: "badge-closed",
};

export function Badge({ variant = "neutral", children, pulse = false, className = "" }: BadgeProps) {
    return (
        <span className={`badge-base ${variantClass[variant]} ${className}`}>
            {pulse && (
                <span
                    className="inline-block w-1.5 h-1.5 rounded-full bg-current animate-pulse"
                    aria-hidden="true"
                />
            )}
            {children}
        </span>
    );
}
