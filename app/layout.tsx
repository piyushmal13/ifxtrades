"use client"

export const dynamic = "force-dynamic"

import "./globals.css"
import { AuthProvider } from "@/lib/auth-provider"
import Header from "@/components/Header"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-white text-[#0F172A]">
        <AuthProvider>
          <Header />
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
