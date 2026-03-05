import { NextRequest, NextResponse } from "next/server";
import { verifyOtp, logOtpEvent, type OtpFailure } from "@/lib/otp";
import { logger } from "@/lib/logger";

/**
 * POST /api/auth/verify-otp
 * Body: { email: string; code: string }
 * Returns: 200 { email_verified: true, userId } | 400/429 { error: string }
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const email: string = (body?.email ?? "").trim().toLowerCase();
        const code: string = (body?.code ?? "").trim();

        if (!email || !code) {
            return NextResponse.json(
                { error: "Email and verification code are required." },
                { status: 400 },
            );
        }

        if (!/^\d{6}$/.test(code)) {
            return NextResponse.json(
                { error: "Verification code must be exactly 6 digits." },
                { status: 400 },
            );
        }

        const result = await verifyOtp(email, code);

        if (!result.ok) {
            // Cast to OtpFailure so TypeScript can access .error and .status
            const { error, status } = result as OtpFailure;
            await logOtpEvent(email, null, "expired", { reason: error });
            return NextResponse.json({ error }, { status });
        }

        const { userId } = result.data;

        return NextResponse.json(
            { email_verified: true, userId, message: "Email verified. Welcome to IFXTrades." },
            { status: 200 },
        );
    } catch (err) {
        logger.error("[verify-otp] Unhandled error:", err);
        return NextResponse.json({ error: "Internal server error." }, { status: 500 });
    }
}
