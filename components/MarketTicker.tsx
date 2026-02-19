"use client"

import { useEffect, useState } from "react"

type MarketItem = {
  symbol: string
  price: number
}

export default function MarketTicker() {
  const [data, setData] = useState<MarketItem[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/market")
        const json = await res.json()

        // Convert object response to array safely
        const formatted: MarketItem[] = [
          { symbol: "BTC", price: json.bitcoin },
          { symbol: "ETH", price: json.ethereum },
          { symbol: "GOLD", price: json.gold },
          { symbol: "EURUSD", price: json.eurusd },
        ]

        setData(formatted)
      } catch (err) {
        console.error("Market fetch error:", err)
        setData([])
      }
    }

    fetchData()
  }, [])

  if (!data.length) return null

  return (
    <div className="bg-[#0F172A] text-white overflow-hidden">
      <div className="whitespace-nowrap animate-marquee py-2 text-sm tracking-wide">
        {data.map((item, i) => (
          <span key={i} className="mx-8">
            <span className="text-[#C6A23A] font-semibold">
              {item.symbol}
            </span>{" "}
            {item.price}
          </span>
        ))}
      </div>
    </div>
  )
}
