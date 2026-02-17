'use client'

import { useEffect, useState } from 'react'

export default function WeeklyInsights() {
  const [summary, setSummary] = useState("Loading insights...")

  useEffect(() => {
    const fetchInsights = async () => {
      const res = await fetch('/api/insights')
      const data = await res.json()
      setSummary(data.summary)
    }

    fetchInsights()
  }, [])

  return (
    <section className="section py-24">
      <h2 className="text-3xl font-bold mb-8 text-[rgb(var(--primary))]">
        Weekly Market Insight
      </h2>

      <div className="card p-10 text-lg leading-relaxed text-[rgb(var(--muted))] shadow-lg">
        {summary}
      </div>
    </section>
  )
}
