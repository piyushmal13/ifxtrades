import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    bitcoin: 68000,
    ethereum: 3500,
    gold: 2300,
    eurusd: 1.09
  })
}
