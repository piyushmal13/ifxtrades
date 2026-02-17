'use client'

import { useEffect, useState } from 'react'

export default function MarketSnapshot() {
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/market')
        const json = await res.json()
        setData(json)
      } catch (err) {
        console.error(err)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 300000)
    return () => clearInterval(interval)
  }, [])

  if (!data) return null

  const renderItem = (symbol: string, label: string) => {
    const item = data[symbol]
    if (!item) return null

    const change = parseFloat(item.percent_change || "0")
    const positive = change >= 0

    return (
      <div className="flex flex-col items-center">
        <span className="font-medium">{label}</span>
        <span>{item.close}</span>
        <span className={`text-xs ${positive ? "text-green-500" : "text-red-500"}`}>
          {item.percent_change}%
        </span>
      </div>
    )
  }

  return (
    <div className="bg-[rgb(var(--card))]/60 backdrop-blur-lg py-2 text-[11px] border-b border-[rgb(var(--border))]">
      <div className="max-w-7xl mx-auto flex justify-around">
        {renderItem("XAU/USD", "Gold")}
        {renderItem("EUR/USD", "EUR/USD")}
        {renderItem("BTC/USD", "Bitcoin")}
        {renderItem("SPY", "S&P 500")}
      </div>
    </div>
  )
}
