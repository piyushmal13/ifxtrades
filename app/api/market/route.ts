import { NextResponse } from "next/server"

export async function GET() {

  try {

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)

    const response = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd",
      { signal: controller.signal }
    )

    clearTimeout(timeout)

    if (!response.ok) {
      throw new Error("API failed")
    }

    const data = await response.json()

    return NextResponse.json({
      bitcoin: data.bitcoin.usd,
      ethereum: data.ethereum.usd
    })

  } catch (error) {

    console.error("Market API Error:", error)

    // SAFE FALLBACK DATA
    return NextResponse.json({
      bitcoin: 0,
      ethereum: 0
    })

  }
}
