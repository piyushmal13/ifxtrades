import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error:
        "Stripe webhook handler is not configured in this repository. Add signature verification and payment/license provisioning logic before enabling live traffic.",
    },
    { status: 501 },
  );
}
