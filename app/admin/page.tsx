"use client"

export const dynamic = "force-dynamic"

import { useAdmin } from "@/lib/useAdmin"
import { useEffect, useState } from "react"

export default function AdminPage() {

  const { role, loading } = useAdmin()

  if (loading) {
    return <div className="p-20">Loading...</div>
  }

  if (role !== "admin") {
    return null
  }

  return (
    <div className="min-h-screen bg-white p-20">
      <h1 className="text-4xl font-semibold text-[#0F172A]">
        Admin Dashboard
      </h1>

      <p className="mt-6 text-gray-600">
        Welcome, Administrator.
      </p>
    </div>
  )
}
