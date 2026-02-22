import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    xauusd: 2314.2,
    eurusd: 1.0823,
    dxy: 103.4,
    us10y: 4.21,
    spx: 5188.5,
  });
}
