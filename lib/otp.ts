/**
 * OTP Utility Library — server-side only
 * All functions must run in Node.js / Edge runtime (no browser imports)
 *
 * Features:
 * - 6-digit generation via crypto
 * - bcryptjs hashing (cost 10)
 * - Attempt tracking & rate limiting
 * - Exponential resend cooldown
 */

import bcrypt from "bcryptjs";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const OTP_TTL_MINUTES = 10;
const OTP_DIGITS = 6;
const MAX_ATTEMPTS = 5;
const MAX_SENDS_PER_HOUR = 5;
const SALT_ROUNDS = 10;

export const RESEND_COOLDOWNS = [30, 60, 120, 300] as const; // seconds

/* ── Types ──────────────────────────────────────────────────── */

export interface OtpRecord {
    id: string;
    user_id: string;
    email: string;
    code_hash: string;
    expires_at: string;
    attempts: number;
    used: boolean;
    created_at: string;
}

export interface OtpSuccess<T> { ok: true; data: T }
export interface OtpFailure { ok: false; error: string; status: number }
export type OtpResult<T> = OtpSuccess<T> | OtpFailure;

/* ── Generation ─────────────────────────────────────────────── */

/** Generate a cryptographically random 6-digit OTP string */
export function generateOtpCode(): string {
    // Use crypto.getRandomValues in both Node & Edge
    const max = 10 ** OTP_DIGITS;
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    const num = arr[0] % max;
    return num.toString().padStart(OTP_DIGITS, "0");
}

/** Hash an OTP code — never store plaintext */
export async function hashOtpCode(code: string): Promise<string> {
    return bcrypt.hash(code, SALT_ROUNDS);
}

/** Verify a code against a stored hash */
export async function verifyOtpCode(code: string, hash: string): Promise<boolean> {
    return bcrypt.compare(code, hash);
}

/* ── Rate Limiting ──────────────────────────────────────────── */

/**
 * Check how many OTPs were sent to this email in the last hour.
 * Returns { allowed: true } or { allowed: false, retryAfterSeconds }
 */
export async function checkSendRateLimit(
    email: string,
): Promise<{ allowed: boolean; retryAfterSeconds?: number; sendCount: number }> {
    const supabase = createSupabaseAdminClient();
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
        .from("otp_events")
        .select("created_at")
        .eq("email", email)
        .eq("event_type", "sent")
        .gte("created_at", oneHourAgo)
        .order("created_at", { ascending: false });

    if (error || !data) return { allowed: true, sendCount: 0 };

    const sendCount = data.length;
    if (sendCount >= MAX_SENDS_PER_HOUR) {
        const oldest = new Date(data[data.length - 1].created_at);
        const retryAt = new Date(oldest.getTime() + 60 * 60 * 1000);
        const retryAfterSeconds = Math.ceil((retryAt.getTime() - Date.now()) / 1000);
        return { allowed: false, retryAfterSeconds, sendCount };
    }

    return { allowed: true, sendCount };
}

/**
 * Return the resend cooldown based on how many sends have occurred.
 * Sequence: 30s, 60s, 120s, 300s (capped)
 */
export function getResendCooldown(sendCount: number): number {
    const idx = Math.min(sendCount, RESEND_COOLDOWNS.length - 1);
    return RESEND_COOLDOWNS[idx];
}

/* ── Create & Store ─────────────────────────────────────────── */

export async function createAndStoreOtp(
    userId: string,
    email: string,
): Promise<OtpResult<{ code: string; cooldownSeconds: number }>> {
    const supabase = createSupabaseAdminClient();

    // Rate limit check
    const rateCheck = await checkSendRateLimit(email);
    if (!rateCheck.allowed) {
        return {
            ok: false,
            error: `Too many verification attempts. Retry in ${rateCheck.retryAfterSeconds}s.`,
            status: 429,
        };
    }

    // Invalidate any existing unused OTPs for this user
    await supabase
        .from("otps")
        .update({ used: true })
        .eq("user_id", userId)
        .eq("used", false);

    // Generate and hash
    const code = generateOtpCode();
    const codeHash = await hashOtpCode(code);
    const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000).toISOString();

    const { error } = await supabase.from("otps").insert({
        user_id: userId,
        email,
        code_hash: codeHash,
        expires_at: expiresAt,
    });

    if (error) {
        return { ok: false, error: "Failed to store OTP. Please try again.", status: 500 };
    }

    const cooldownSeconds = getResendCooldown(rateCheck.sendCount);
    return { ok: true, data: { code, cooldownSeconds } };
}

/* ── Verification ───────────────────────────────────────────── */

export async function verifyOtp(
    email: string,
    code: string,
): Promise<OtpResult<{ userId: string }>> {
    const supabase = createSupabaseAdminClient();

    // Get the latest valid OTP for this email
    const { data: otps, error } = await supabase
        .from("otps")
        .select("*")
        .eq("email", email)
        .eq("used", false)
        .order("created_at", { ascending: false })
        .limit(1);

    if (error || !otps?.length) {
        return { ok: false, error: "No active verification code found. Please request a new one.", status: 400 };
    }

    const otp = otps[0] as OtpRecord;

    // Check expiry
    if (new Date(otp.expires_at) < new Date()) {
        await supabase.from("otps").update({ used: true }).eq("id", otp.id);
        return { ok: false, error: "Verification code has expired. Please request a new one.", status: 400 };
    }

    // Check attempt limit
    if (otp.attempts >= MAX_ATTEMPTS) {
        await supabase.from("otps").update({ used: true }).eq("id", otp.id);
        return { ok: false, error: "Too many incorrect attempts. Please request a new code.", status: 429 };
    }

    // Verify hash
    const valid = await verifyOtpCode(code, otp.code_hash);

    if (!valid) {
        // Increment attempts
        await supabase
            .from("otps")
            .update({ attempts: otp.attempts + 1 })
            .eq("id", otp.id);

        const remaining = MAX_ATTEMPTS - (otp.attempts + 1);
        return {
            ok: false,
            error: `Invalid code. ${remaining} attempt${remaining !== 1 ? "s" : ""} remaining.`,
            status: 400,
        };
    }

    // Success: mark as used, set email_verified
    await supabase.from("otps").update({ used: true }).eq("id", otp.id);

    await supabase
        .from("profiles")
        .update({ email_verified: true })
        .eq("id", otp.user_id);

    await logOtpEvent(email, otp.user_id, "verified");

    return { ok: true, data: { userId: otp.user_id } };
}

/* ── Event Logging ──────────────────────────────────────────── */

export async function logOtpEvent(
    email: string,
    userId: string | null,
    eventType: "sent" | "failed" | "verified" | "expired" | "rate_limited",
    meta?: Record<string, unknown>,
) {
    try {
        const supabase = createSupabaseAdminClient();
        await supabase.from("otp_events").insert({
            email,
            user_id: userId,
            event_type: eventType,
            meta: meta ?? null,
        });
    } catch {
        // Never throw from logging
        console.error("[OTP] Failed to log event:", eventType, email);
    }
}

/* ── Admin Metrics ──────────────────────────────────────────── */

export async function getOtpMetrics(since: Date) {
    const supabase = createSupabaseAdminClient();
    const { data } = await supabase
        .from("otp_events")
        .select("event_type, created_at")
        .gte("created_at", since.toISOString());

    if (!data) return null;

    const totals = data.reduce(
        (acc, row) => {
            acc[row.event_type] = (acc[row.event_type] || 0) + 1;
            return acc;
        },
        {} as Record<string, number>,
    );

    const sent = totals["sent"] || 0;
    const failed = totals["failed"] || 0;
    const verified = totals["verified"] || 0;

    return {
        sent,
        failed,
        verified,
        deliveryFailureRate: sent > 0 ? ((failed / sent) * 100).toFixed(1) + "%" : "0%",
        verifySuccessRate: sent > 0 ? ((verified / sent) * 100).toFixed(1) + "%" : "0%",
    };
}
