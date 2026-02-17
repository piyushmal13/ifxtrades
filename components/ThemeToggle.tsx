'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const isDark = theme === 'dark'

  return (
    <div
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="relative w-14 h-7 bg-[rgb(var(--border))] rounded-full cursor-pointer transition-colors duration-300"
    >
      <div
        className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-[rgb(var(--primary))] transition-transform duration-300 ${
          isDark ? 'translate-x-7' : ''
        }`}
      />
    </div>
  )
}
