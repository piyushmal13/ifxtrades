/**
 * Feature flags — read from env so they can be toggled without redeployment.
 * Set NEXT_PUBLIC_AUTH_V1_ENABLED=true in .env.local to enable.
 *
 * Rollout: 5% day 1 → 25% day 3 → 100% day 7
 */

export const FLAGS = {
    /** Master switch: unified AuthModal + OTP email verification gating */
    AUTH_V1: process.env.NEXT_PUBLIC_AUTH_V1_ENABLED === "true",

    /** Enable exponential resend cooldown for OTP */
    OTP_COOLDOWN: process.env.NEXT_PUBLIC_OTP_COOLDOWN_ENABLED !== "false",

    /** Enable admin OTP retry UI */
    ADMIN_OTP_RETRY: process.env.NEXT_PUBLIC_ADMIN_OTP_RETRY === "true",
} as const;

export type FlagName = keyof typeof FLAGS;

/** Deterministic percentage rollout based on user email hash */
export function isInRollout(email: string, percent: number): boolean {
    if (percent >= 100) return true;
    if (percent <= 0) return false;
    // Simple checksum — deterministic per email, not cryptographically sensitive
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
        hash = ((hash << 5) - hash + email.charCodeAt(i)) | 0;
    }
    return Math.abs(hash) % 100 < percent;
}
