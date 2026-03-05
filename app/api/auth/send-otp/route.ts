import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createAndStoreOtp, logOtpEvent, OtpFailure } from "@/lib/otp";
import { Resend } from "resend";
import { User } from "@supabase/supabase-js";
import { logger } from "@/lib/logger";

import { getSiteUrl } from "@/lib/site";

/**
 * POST /api/auth/send-otp
 * Body: { email: string }
 * Returns: { resendCooldownSeconds: number }
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const email: string = (body?.email ?? "").trim().toLowerCase();

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
        }

        // Look up user by email via admin list (getUserByEmail not in SDK)
        const supabase = createSupabaseAdminClient();
        const { data: listData } = await supabase.auth.admin.listUsers({ perPage: 50000 });
        const authUser = listData?.users?.find((u: User) => u.email?.toLowerCase() === email);

        if (!authUser) {
            // Generic message to prevent user enumeration
            return NextResponse.json(
                { message: "If this email is registered, a code will be sent.", resendCooldownSeconds: 30 },
                { status: 200 },
            );
        }

        const userId = authUser.id;

        // Create OTP — handles rate limiting, hashing, DB insert
        const result = await createAndStoreOtp(userId, email);

        if (!result.ok) {
            const { error, status } = result as OtpFailure;
            await logOtpEvent(email, userId, "rate_limited", { reason: error });
            return NextResponse.json({ error }, { status });
        }

        const { code, cooldownSeconds } = result.data;

        // Generate fallback magic link (24h TTL)
        let fallbackLink: string | undefined;
        try {
            const { data: linkData } = await supabase.auth.admin.generateLink({
                type: "magiclink",
                email,
                options: { redirectTo: `${getSiteUrl()}/auth/callback?next=/dashboard` },
            });
            fallbackLink = linkData?.properties?.action_link;
        } catch {
            // Non-fatal
        }

        const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy");

        // Send email via Resend
        const { error: emailError } = await resend.emails.send({
            from: "IFXTrades Security <security@ifxtrades.com>",
            to: email,
            subject: `IFXTrades Verification Code: ${code}`,
            html: buildOtpEmailHtml({ code, fallbackLink }),
            text: `Your IFXTrades verification code: ${code}\nExpires in 10 minutes.\n${fallbackLink ? `Or verify instantly: ${fallbackLink}` : ""}`,
        });

        if (emailError) {
            logger.error("[send-otp] Email delivery failed:", emailError);
            await logOtpEvent(email, userId, "failed", { emailError: String(emailError) });
            return NextResponse.json(
                { error: "Failed to send verification email. Please try again." },
                { status: 500 },
            );
        }

        await logOtpEvent(email, userId, "sent");

        return NextResponse.json({ resendCooldownSeconds: cooldownSeconds }, { status: 200 });
    } catch (err) {
        logger.error("[send-otp] Unhandled error:", err);
        return NextResponse.json({ error: "Internal server error." }, { status: 500 });
    }
}

function buildOtpEmailHtml({ code, fallbackLink }: { code: string; fallbackLink?: string }) {
    return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"/></head>
<body style="background:#020617;color:#f1f5f9;font-family:Inter,sans-serif;margin:0;padding:40px 20px">
  <div style="max-width:480px;margin:0 auto;background:#0d1117;border:1px solid rgba(212,175,55,0.18);border-radius:12px;padding:40px">
    <div style="text-align:center;margin-bottom:32px">
      <div style="font-family:Georgia,serif;font-size:20px;color:#d4af37;letter-spacing:0.1em">IFXTrades</div>
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.2em;color:#64748b;margin-top:4px">Institutional Capital Intelligence</div>
    </div>
    <h1 style="font-size:18px;font-weight:600;text-align:center;margin-bottom:8px">Verify Your Email</h1>
    <p style="font-size:14px;color:#94a3b8;text-align:center;line-height:1.6;margin-bottom:32px">
      Enter this code in the IFXTrades app. Expires in <strong style="color:#f1f5f9">10 minutes</strong>.
    </p>
    <div style="background:#020617;border:1px solid rgba(212,175,55,0.25);border-radius:8px;padding:24px;text-align:center;margin-bottom:32px">
      <span style="font-size:40px;font-weight:700;letter-spacing:0.5em;color:#d4af37;font-variant-numeric:tabular-nums">${code}</span>
    </div>
    ${fallbackLink ? `<div style="text-align:center;margin-bottom:24px"><a href="${fallbackLink}" style="color:#d4af37;font-size:13px">Or verify with one click →</a></div>` : ""}
    <p style="font-size:11px;color:#374151;text-align:center;line-height:1.6;border-top:1px solid rgba(255,255,255,0.05);padding-top:20px">
      If you did not request this, ignore this email. Contact: security@ifxtrades.com
    </p>
  </div>
</body></html>`;
}
