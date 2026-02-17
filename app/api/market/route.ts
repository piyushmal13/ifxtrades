let cachedData: any = null
let lastFetchTime = 0

export async function GET() {
  const now = Date.now()
  const fiveMinutes = 5 * 60 * 1000

  // If cached and not expired
  if (cachedData && now - lastFetchTime < fiveMinutes) {
    return Response.json(cachedData)
  }

  try {
    const symbols = "XAU/USD,EUR/USD,BTC/USD,SPY"
    const apiKey = process.env.TWELVEDATA_API_KEY

    const res = await fetch(
      `https://api.twelvedata.com/quote?symbol=${symbols}&apikey=${apiKey}`
    )

    const data = await res.json()

    cachedData = data
    lastFetchTime = now

    return Response.json(data)
  } catch (error) {
    return Response.json({ error: "Market data unavailable" })
  }
}
