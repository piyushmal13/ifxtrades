'use client'

import { useEffect, useRef, useState } from 'react'
import { logger } from '@/lib/logger'

// Market API returns lowercase underscore keys e.g. xauusd, eurusd, btcusd, spx
type MarketData = {
  xauusd?: number
  eurusd?: number
  btcusd?: number
  spx?: number
  dxy?: number
  us10y?: number
}

const POLL_INTERVAL_MS = 300_000 // 5 minutes
const MAX_FAILURES = 3
const BACKOFF_BASE_MS = 10_000 // 10s base for exponential backoff

function formatNumber(val: number | undefined, decimals = 2): string {
  if (val === undefined || val === null) return '—'
  return val.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

export default function MarketSnapshot() {
  const [data, setData] = useState<MarketData | null>(null)
  const [unavailable, setUnavailable] = useState(false)
  const failureCount = useRef(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const backoffRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimers = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (backoffRef.current) clearTimeout(backoffRef.current)
  }

  const fetchData = async () => {
    try {
      const res = await fetch('/api/market')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json: MarketData = await res.json()
      setData(json)
      setUnavailable(false)
      failureCount.current = 0
    } catch {
      failureCount.current += 1
      if (process.env.NODE_ENV === 'development') {
        logger.warn(`[MarketSnapshot] fetch failed (attempt ${failureCount.current})`)
      }
      if (failureCount.current >= MAX_FAILURES) {
        setUnavailable(true)
        // Stop polling — exponential backoff recovery attempt
        clearTimers()
        const delay = BACKOFF_BASE_MS * 2 ** (failureCount.current - MAX_FAILURES)
        backoffRef.current = setTimeout(() => {
          failureCount.current = 0
          setUnavailable(false)
          fetchData()
          intervalRef.current = setInterval(fetchData, POLL_INTERVAL_MS)
        }, Math.min(delay, 5 * 60_000)) // cap at 5 minutes
      }
    }
  }

  useEffect(() => {
    fetchData()
    intervalRef.current = setInterval(fetchData, POLL_INTERVAL_MS)
    return clearTimers
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (unavailable) {
    return (
      <div className="bg-[rgb(var(--card))]/60 backdrop-blur-lg py-2 text-[11px] border-b border-[rgb(var(--border))]">
        <div className="max-w-7xl mx-auto flex justify-center">
          <span className="text-white/30 italic">Market data temporarily unavailable</span>
        </div>
      </div>
    )
  }

  if (!data) return null

  const items: { label: string; value: string }[] = [
    { label: 'Gold', value: formatNumber(data.xauusd) },
    { label: 'EUR/USD', value: formatNumber(data.eurusd, 4) },
    { label: 'Bitcoin', value: formatNumber(data.btcusd, 0) },
    { label: 'S&P 500', value: formatNumber(data.spx, 2) },
  ]

  return (
    <div className="bg-[rgb(var(--card))]/60 backdrop-blur-lg py-2 text-[11px] border-b border-[rgb(var(--border))]">
      <div className="max-w-7xl mx-auto flex justify-around">
        {items.map(({ label, value }) => (
          <div key={label} className="flex flex-col items-center">
            <span className="font-medium">{label}</span>
            <span>{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
