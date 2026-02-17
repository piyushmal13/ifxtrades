let cachedInsight: any = null
let lastFetch = 0

export async function GET() {
  const now = Date.now()
  const oneHour = 60 * 60 * 1000

  if (cachedInsight && now - lastFetch < oneHour) {
    return Response.json(cachedInsight)
  }

  try {
    const apiKey = process.env.TWELVEDATA_API_KEY

    const res = await fetch(
      `https://api.twelvedata.com/time_series?symbol=XAU/USD&interval=1week&outputsize=2&apikey=${apiKey}`
    )

    const data = await res.json()

    if (!data.values) {
      return Response.json({ summary: "Market insight unavailable." })
    }

    const latest = parseFloat(data.values[0].close)
    const previous = parseFloat(data.values[1].close)

    const change = latest - previous

    const summary =
      change > 0
        ? "Gold continues positive weekly momentum, reflecting sustained institutional demand."
        : "Gold shows short-term retracement after prior bullish structure."

    cachedInsight = { summary }
    lastFetch = now

    return Response.json(cachedInsight)

  } catch (error) {
    return Response.json({ summary: "Market insight unavailable." })
  }
}
