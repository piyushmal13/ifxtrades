import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const symbols = ["XAU/USD", "EUR/USD", "GBP/USD", "BTC/USD"]

    const requests = symbols.map(symbol =>
      fetch(`https://api.twelvedata.com/price?symbol=${symbol}&apikey=demo`, {
        next: { revalidate: 60 }
      }).then(res => res.json())
    )

    const results = await Promise.all(requests)

    const formatted = results.map((data, i) => ({
      symbol: symbols[i],
      price: data.price || "N/A"
    }))

    return NextResponse.json(formatted)
  } catch (err) {
    return NextResponse.json([])
  }
}
