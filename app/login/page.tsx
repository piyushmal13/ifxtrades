"use client"

import { Suspense } from "react"
import LoginClient from "./LoginClient"

export const dynamic = "force-dynamic"

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-20">Loading...</div>}>
      <LoginClient />
    </Suspense>
  )
}
