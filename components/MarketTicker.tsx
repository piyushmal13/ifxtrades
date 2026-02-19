"use client"

import { useEffect, useState } from "react"

export default function MarketTicker() {

  const [data, setData] = useState<any[]>([])

  useEffect(() => {
    fetch("/api/market")
      .then(res => res.json())
      .then(setData)
  }, [])

  return (
    <div className="w-full bg-[#0E1A2B] text-white overflow-hidden border-b border-[#C6A23A]/30">

      <div className="whitespace-nowrap animate-marquee py-2 text-sm tracking-wide">

        {data.map((item, i) => (
          <span key={i} className="mx-8">
            <span className="text-[#C6A23A] font-semibold">
              {item.symbol}
            </span>
            {" "}
            {item.price}
          </span>
        ))}

      </div>

    </div>
  )
}
