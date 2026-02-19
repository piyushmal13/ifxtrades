"use client"

import React from "react"

export const dynamic = "force-dynamic"

import './globals.css'
import { AuthProvider } from "@/lib/auth-provider"
import Header from "@/components/Header"
import MarketTicker from "@/components/MarketTicker"

export const metadata = {
  title: "IFXTrades",
  description: "Institutional Capital Intelligence",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>

        <AuthProvider>

          {/* TOP TICKER */}
          <MarketTicker />

          {/* HEADER */}
          <Header />

          {/* MAIN CONTENT */}
          {children}

        </AuthProvider>

      </body>
    </html>
  )
}

