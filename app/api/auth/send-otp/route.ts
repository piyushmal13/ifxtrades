import { NextResponse } from "next/server";

/**
 * Legacy endpoint kept for backward compatibility.
 * Verification now happens directly through Supabase on /verify.
 */
export async function POST() {
  return NextResponse.json(
    {
      error: "This endpoint is deprecated. Use /verify for email verification.",
      code: "OTP_ENDPOINT_DEPRECATED",
    },
    { status: 410 },
  );
}
